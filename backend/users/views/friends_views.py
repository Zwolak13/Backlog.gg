from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from ..models import User, Friendship, FriendRequest


def serialize_friend(user):
    return {
        "username": user.username,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
    }


def get_friends(user):
    friendships = Friendship.objects.filter(
        Q(from_user=user) | Q(to_user=user)
    ).select_related("from_user", "to_user")
    seen = set()
    result = []
    for f in friendships:
        other = f.to_user if f.from_user == user else f.from_user
        if other.id not in seen:
            seen.add(other.id)
            result.append(serialize_friend(other))
    return result


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friends_list_view(request):
    return Response({"friends": get_friends(request.user)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_friend_view(request):
    username = request.data.get("username")
    if not username:
        return Response({"error": "username is required"}, status=400)

    target = get_object_or_404(User, username=username)
    if target == request.user:
        return Response({"error": "Cannot add yourself"}, status=400)

    _, created = Friendship.objects.get_or_create(from_user=request.user, to_user=target)
    if not created:
        return Response({"error": "Already friends"}, status=400)

    return Response({"message": f"Added {username}"}, status=201)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_friend_view(request, username):
    target = get_object_or_404(User, username=username)
    Friendship.objects.filter(from_user=request.user, to_user=target).delete()
    Friendship.objects.filter(from_user=target, to_user=request.user).delete()
    return Response({"message": f"Removed {username}"})


@api_view(["GET"])
def public_friends_list_view(request, username):
    user = get_object_or_404(User, username=username)
    return Response({"friends": get_friends(user)})


@api_view(["GET"])
def public_profile_view(request, username):
    user = get_object_or_404(User, username=username)
    return Response({
        "username": user.username,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "created_at": user.created_at,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_users_view(request):
    q = request.GET.get("q", "").strip()
    if not q or len(q) < 2:
        return Response({"users": []})

    users = User.objects.filter(username__icontains=q).exclude(id=request.user.id)[:10]

    friend_ids = set(Friendship.objects.filter(from_user=request.user).values_list("to_user_id", flat=True))
    sent_ids = set(FriendRequest.objects.filter(from_user=request.user, status="pending").values_list("to_user_id", flat=True))
    received_ids = set(FriendRequest.objects.filter(to_user=request.user, status="pending").values_list("from_user_id", flat=True))

    result = []
    for u in users:
        if u.id in friend_ids:
            relation = "friend"
        elif u.id in sent_ids:
            relation = "request_sent"
        elif u.id in received_ids:
            relation = "request_received"
        else:
            relation = "none"
        result.append({
            "username": u.username,
            "avatar_url": u.avatar_url,
            "bio": u.bio,
            "relation": relation,
        })

    return Response({"users": result})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_friend_request_view(request):
    username = request.data.get("username")
    if not username:
        return Response({"error": "username required"}, status=400)

    target = get_object_or_404(User, username=username)
    if target == request.user:
        return Response({"error": "Cannot add yourself"}, status=400)

    if Friendship.objects.filter(Q(from_user=request.user, to_user=target) | Q(from_user=target, to_user=request.user)).exists():
        return Response({"error": "Already friends"}, status=400)

    if FriendRequest.objects.filter(from_user=request.user, to_user=target, status="pending").exists():
        return Response({"error": "Request already sent"}, status=400)

    FriendRequest.objects.update_or_create(
        from_user=request.user,
        to_user=target,
        defaults={"status": "pending"},
    )

    return Response({"message": f"Request sent to {username}"}, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_requests_view(request):
    incoming = FriendRequest.objects.filter(to_user=request.user, status="pending").select_related("from_user")
    outgoing = FriendRequest.objects.filter(from_user=request.user, status="pending").select_related("to_user")

    return Response({
        "incoming": [
            {"id": r.id, "from_user": serialize_friend(r.from_user), "created_at": r.created_at}
            for r in incoming
        ],
        "outgoing": [
            {"id": r.id, "to_user": serialize_friend(r.to_user), "created_at": r.created_at}
            for r in outgoing
        ],
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_request_view(request, pk):
    fr = get_object_or_404(FriendRequest, pk=pk, to_user=request.user, status="pending")
    fr.status = "accepted"
    fr.save()
    Friendship.objects.get_or_create(from_user=request.user, to_user=fr.from_user)
    Friendship.objects.get_or_create(from_user=fr.from_user, to_user=request.user)
    return Response({"message": "Request accepted"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def decline_request_view(request, pk):
    fr = get_object_or_404(FriendRequest, pk=pk, to_user=request.user, status="pending")
    fr.status = "declined"
    fr.save()
    return Response({"message": "Request declined"})
