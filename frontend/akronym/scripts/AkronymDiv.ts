import { AkronymState, AkronymAnimation, AkronymVisibility } from './AkronymGlobal.js';
export class AkronymDiv extends HTMLDivElement {

    public animations: Partial<Record<AkronymState | AkronymVisibility, AkronymAnimation>> =
    {
        visible: 'fade-in',
        hidden: 'fade-out',
    };

    constructor(){
        super();
    };
}