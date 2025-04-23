export function init({ navigateTo }: { navigateTo: (path: string) => void }): Lobby {
    return new Lobby(navigateTo);
}

class Lobby {
    public page: any;

    constructor(navigateTo: (path: string) => void) {

    }

    
}