class UserNotFound(RuntimeError):
    pass


class UserAlreadyExists(RuntimeError):
    pass


class LobbyNotFound(RuntimeError):
    pass


class LobbyAlreadyExists(RuntimeError):
    pass