from django.db.models import Q

from .models import Friendship


def friendship_query(user):
    return Q(from_user=user) | Q(to_user=user)


def get_friend_ids(user) -> set[int]:
    friendships = Friendship.objects.filter(friendship_query(user)).values_list(
        "from_user_id",
        "to_user_id",
    )

    friend_ids: set[int] = set()
    for from_user_id, to_user_id in friendships:
        friend_ids.add(to_user_id if from_user_id == user.id else from_user_id)

    friend_ids.discard(user.id)
    return friend_ids
