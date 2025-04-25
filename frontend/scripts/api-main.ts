export abstract class APIMain {
    private static readonly BASE_URL = '';

    // USER
    public static async createUser(username: string): Promise<{ name: string, id: string }> {
        const response = await fetch(this.BASE_URL + '/api/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ name: username })
        });
    
        if (!response.ok) {
            throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
        }
    
        return await response.json();
    }
    
    public static async getUser(id: string): Promise<{ name: string, id: string }> {
        const response = await fetch(this.BASE_URL + `/api/users/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
    
        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        }
    
        return await response.json();
    }
    // USER

    // LOBBY
    public static async createLobby(name: string, creatorId: string): Promise<{
        pk: string,
        name: string,
        creator_id: string,
        status: string,
        player_ids: string[],
        [key: string]: any
    }> {
        const response = await fetch(this.BASE_URL + '/api/lobby/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name,
                creator_id: creatorId
            })
        });
    
        if (!response.ok) {
            throw new Error(`Failed to create lobby: ${response.status} ${response.statusText}`);
        }
    
        return await response.json();
    }

    public static async joinLobby(lobbyId: string): Promise<{
        pk: string,
        name: string,
        creator_id: string,
        status: string,
        player_ids: string[],
        [key: string]: any
    }> {
        const response = await fetch(this.BASE_URL + `/api/lobby/join/${lobbyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(lobbyId)
        });
    
        if (!response.ok) {
            throw new Error(`Failed to join lobby: ${response.status} ${response.statusText}`);
        }
    
        return await response.json();
    }    
    // LOBBY
}