import json
from channels.generic.websocket import AsyncWebsocketConsumer

online_users: set[str] = set()


class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if not self.scope["user"].is_authenticated:
            await self.close()
            return

        self.username = self.scope["user"].username
        online_users.add(self.username)

        await self.channel_layer.group_add("presence", self.channel_name)
        await self.accept()

        await self.channel_layer.group_send("presence", {
            "type": "presence.update",
            "online": list(online_users),
        })

    async def disconnect(self, close_code):
        online_users.discard(getattr(self, "username", None))

        await self.channel_layer.group_discard("presence", self.channel_name)

        await self.channel_layer.group_send("presence", {
            "type": "presence.update",
            "online": list(online_users),
        })

    async def presence_update(self, event):
        await self.send(text_data=json.dumps({"online": event["online"]}))
