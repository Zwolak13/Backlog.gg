import json
from collections import defaultdict

from channels.generic.websocket import AsyncWebsocketConsumer

# Map username -> number of open connections, so a user with multiple tabs
# stays "online" until their last connection closes.
connection_counts: dict[str, int] = defaultdict(int)


def online_usernames() -> list[str]:
    return [username for username, count in connection_counts.items() if count > 0]


class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if not self.scope["user"].is_authenticated:
            await self.close()
            return

        self.username = self.scope["user"].username
        connection_counts[self.username] += 1

        await self.channel_layer.group_add("presence", self.channel_name)
        await self.accept()

        await self.channel_layer.group_send("presence", {
            "type": "presence.update",
            "online": online_usernames(),
        })

    async def disconnect(self, close_code):
        username = getattr(self, "username", None)
        if username is not None and connection_counts.get(username, 0) > 0:
            connection_counts[username] -= 1
            if connection_counts[username] <= 0:
                connection_counts.pop(username, None)

        await self.channel_layer.group_discard("presence", self.channel_name)

        await self.channel_layer.group_send("presence", {
            "type": "presence.update",
            "online": online_usernames(),
        })

    async def presence_update(self, event):
        await self.send(text_data=json.dumps({"online": event["online"]}))
