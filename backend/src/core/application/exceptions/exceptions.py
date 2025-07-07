class UserNotFound(RuntimeError):
    pass


class UserAlreadyExists(RuntimeError):
    pass


class UserAlreadyInLobby(RuntimeError):
    pass


class UserNotInLobby(RuntimeError):
    pass


class LobbyNotFound(RuntimeError):
    pass


class LobbyAlreadyExists(RuntimeError):
    pass


class GameAlreadyStarted(RuntimeError):
    pass
