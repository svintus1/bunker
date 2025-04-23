import { AkronymAnimator } from "../akronym/scripts/AkronymAnimator.js";
export function init({ navigateTo }: { navigateTo: (path: string) => void }): Lobby {
    return new Lobby(navigateTo);
}

class CodeLine {
    public text: string;
    public color: string;
    public duration: number;

    constructor(text:string, color:string, duration:number){
        this.text = text;
        this.color = color;
        this.duration = duration;
    }
}

class Lobby {
    public page: any;
    public terminal: HTMLDivElement;
    private bootUpSound: HTMLAudioElement;
    private coolerSound: HTMLAudioElement;
    private startUpSound: HTMLAudioElement;
    private lines: HTMLDivElement;

    private musicStatus: HTMLButtonElement;

    constructor(navigateTo: (path: string) => void) {
        this.terminal = document.getElementById('terminal') as HTMLDivElement;
        this.bootUpSound = document.querySelector('audio#boot-up') as HTMLAudioElement;
        this.coolerSound = document.querySelector('audio#cooler') as HTMLAudioElement;
        this.lines = document.querySelector('#lines') as HTMLDivElement;
        this.startUpSound = document.querySelector('audio#start-up') as HTMLAudioElement;
        
        this.musicStatus = document.querySelector('#music-status') as HTMLButtonElement;
        console.log(this.musicStatus);
        AkronymAnimator.changeVisibility(this.musicStatus, "hidden", 'fade-out', 0)

        this.startAudio();
        setTimeout(() => {
            this.bootUp();
        }, 2000);
    }

    private bootSequence: CodeLine[] = [
        ///// ФАЗА 1: СТАНДАРТНАЯ ИНИЦИАЛИЗАЦИЯ /////
        new CodeLine(">> [BOOT] BunkerOS v7.4.0-Ψ3 INITIALIZING...", "#00ff00", 400),
        new CodeLine(">> BIOS: CRYPTECH SECURE BOOT v4.2", "#00ff00", 30),
        new CodeLine(">> MEMTEST: 8743MB OK | 32MB RESERVED", "#00ff00", 30),
        new CodeLine(">> Mounting /dev/core/bsys [LUKS-ENCRYPTED]", "#00ff00", 40),
        new CodeLine(">> [!] UNEXPECTED HASH IN /boot/vmlinuz-3.2.1", "#ffff00", 200),
        new CodeLine(">> OVERRIDE ACCEPTED [AUTH: BIOS_RECOVERY]", "#00ff00", 80),
    
        ///// ФАЗА 2: ПРОВЕРКА СИСТЕМ ЖИЗНЕОБЕСПЕЧЕНИЯ /////
        new CodeLine(">> INITIALIZING LIFE SUPPORT MONITOR...", "#00ffff", 50),
        new CodeLine(">> O2 LEVELS: 21.3% (+-0.5% variance)", "#00ff00", 30),
        new CodeLine(">> CO2 SCRUBBERS: 78% EFFICIENCY", "#ffff00", 30),
        new CodeLine(">> CRYOGENIC SYSTEMS:", "#00ff00", 40),
        new CodeLine(">> POD #01: OPERATIONAL (-112°C)", "#00ff00", 30),
        new CodeLine(">> POD #02: DEGRADED (THERMAL DRIFT +3°C)", "#ffff00", 30),
        new CodeLine(">> POD #03: OFFLINE [LAST STATE: FAILED SEAL]", "#ff0000", 400),
        new CodeLine(">> WARNING: POD #03 BIOSAMPLE CONTAINMENT BREACH", "#ff0000", 300),
        new CodeLine(">> AUTO-QUARANTINE PROTOCOL ENGAGED", "#ffff00", 150),
    
        ///// ФАЗА 3: ЗАГРУЗКА КРИТИЧЕСКИХ СИСТЕМ /////
        new CodeLine(">> LOADING SECURITY SUBSYSTEM...", "#00ff00", 60),
        new CodeLine(">> BLACK ICE FIRMWARE v2.1.3 ONLINE", "#00ffff", 40),
        new CodeLine(">> MOTION SENSORS: 142/144 ACTIVE", "#00ff00", 30),
        new CodeLine(">> [!] SENSOR X-12/Y-88: PERMANENT OFFLINE", "#ffff00", 80),
        new CodeLine(">> SCANNING SUBSYSTEMS:", "#00ff00", 50),
        new CodeLine(">> RADIATION SHIELD: 98% INTEGRITY", "#00ff00", 30),
        new CodeLine(">> AIRLOCKS: PRIMARY/ SECONDARY/ TERTIARY OK", "#00ff00", 30),
        new CodeLine(">> HYDROPONICS: 73% OPERATIONAL", "#ffff00", 40),
        new CodeLine(">> AI CORE: UNEXPECTED FIRMWARE SIGNATURE", "#ff0000", 300),
    
        ///// ФАЗА 4: АНОМАЛИИ И СБОИ /////
        new CodeLine(">> [!] CORRUPTION IN /dev/mem/0xFA404", "#ff0000", 100),
        new CodeLine(">> MEMORY FRAGMENT RECOVERED:", "#ffff00", 50),
        new CodeLine(">> '...thermal event in sector Gamma...'", "#aaaaaa", 200),
        new CodeLine(">> ATTEMPTING MEMORY REMAP...", "#ffff00", 40),
        new CodeLine(">> WARNING: 47 BAD SECTORS FOUND", "#ff0000", 150),
        new CodeLine(">> SWITCHING TO REDUNDANT CONTROLLER", "#00ff00", 80),
    
        ///// ФАЗА 5: ЗАГРУЗКА ДАННЫХ /////
        new CodeLine(">> DECRYPTING ARCHIVE 'ATLAS'...", "#00ffff", 70),
        new CodeLine(">> MAP SECTORS:", "#00ff00", 30),
        new CodeLine(">> SECTOR A1: ████████████████████ 100%", "#00ff00", 30),
        new CodeLine(">> SECTOR B2: ████████████         64%", "#ffff00", 40),
        new CodeLine(">> SECTOR G7:                      0%", "#ff0000", 50),
        new CodeLine(">> ERROR: GEODATA CRC MISMATCH IN SECTOR B2", "#ff0000", 200),
        new CodeLine(">> FALLBACK TO LOCAL CACHE...", "#ffff00", 80),
    
        ///// ФАЗА 6: АКТИВАЦИЯ ЗАЩИТНЫХ СИСТЕМ /////
        new CodeLine(">> ENGAGING DEFENSE PROTOCOLS...", "#00ffff", 60),
        new CodeLine(">> AUTO-TURRETS: CALIBRATING...", "#00ff00", 40),
        new CodeLine(">> NEUROTOXIN GENERATOR: STANDBY", "#ffff00", 50),
        new CodeLine(">> [!] SUBSYSTEM X24: UNAUTHORIZED ACCESS", "#ff0000", 300),
        new CodeLine(">> CONTAINMENT PROTOCOL 'IRON CURTAIN' ACTIVATED", "#ff0000", 150),
        new CodeLine(">> FAILURE: SHIELD GENERATOR OFFLINE", "#ff0000", 200),
        new CodeLine(">> FALLBACK TO MANUAL OVERRIDE...", "#ffff00", 100),
    
        ///// ФАЗА 7: ЛОГИ И АРТЕФАКТЫ /////
        new CodeLine(">> DECODING LEGACY MESSAGES...", "#888888", 120),
        new CodeLine(">> LOG_ENTRY 3421: 'They never fixed the heat sink...'", "#aaaaaa", 200),
        new CodeLine(">> SIGNATURE: TECH_OFFICER_█▓  [ACCESS REVOKED]", "#555555", 100),
        new CodeLine(">> AUDIO LOG EXTRACT: '...the frost follows us...'", "#888888", 250),
        new CodeLine(">> UNKNOWN DATA FORMAT: 0xDEADFADE:BEEFCAFE", "#ff0000", 80),
        new CodeLine(">> CORRELATING WITH PRIOR INCIDENTS...", "#ffff00", 150),
    
        ///// ФАЗА 8: ФИНАЛЬНЫЙ СТАТУС /////
        new CodeLine(">> SYSTEM STATUS: OPERATIONAL [WITH ERRORS]", "#ffff00", 200),
        new CodeLine(">> ACTIVE ANOMALIES: 14 CRITICAL, 27 WARNINGS", "#ff0000", 150),
        new CodeLine(">> SECURITY STATUS: COMPROMISED [TIER 3]", "#ff0000", 200),
        new CodeLine(">> RECOMMENDED ACTION: IMMEDIATE MANUAL INSPECTION", "#ff0000", 300),
        new CodeLine(">> BOOT CYCLE COMPLETE", "#00ff00", 100),
    
        ///// ФАЗА 9: ФОНТАННЫЕ ПРОЦЕССЫ /////
        new CodeLine(">> [BACKGROUND] GHOST PROCESS DETECTED", "#555555", 80),
        new CodeLine(">> UNREGISTERED ENTITY IN VENTILATION SHAFT 4B", "#ff0000", 120),
        new CodeLine(">> THERMAL ANOMALY: ROOM X-12/Y-88 (+3.7°C)", "#ffff00", 100),
        new CodeLine(">> AUTOMATIC PURGE SCHEDULED [ETA 47H 59M]", "#00ff00", 200),
        new CodeLine(">> WARNING: UNKNOWN PROCESS ACCESSING CAMERAS", "#ff0000", 150),
        new CodeLine(">> LAST MESSAGE: '...it's in the walls...'", "#aaaaaa", 300),
        new CodeLine(">> SYSTEM READY", "#00ff00", 500),
        
    ];
    private bunkerOSSequence: CodeLine[] = [
        // Постепенное проявление арта сверху вниз с эффектом "сканирования"
        new CodeLine("           ▄▄▄▄▄▄▄▄▄▄▄▄           ", "#00ffff", 25),
        new CodeLine("       ▄▄██▀▀▀▀▀▀▀▀▀▀▀▀██▄▄       ", "#00ffff", 25),
        new CodeLine("     ▄██▀▄              ▄▀██▄     ", "#00ffff", 25),
        new CodeLine("   ▄██▀▄███            ███▄▀██▄   ", "#00ffff", 25),
        new CodeLine("  ██▀▄██████          ██████▄▀██  ", "#00ffff", 25),
        new CodeLine(" ██ █████████▄      ▄█████████ ██ ", "#00ffff", 25),
        new CodeLine("██ ███████████▄    ▄███████████ ██", "#00ffff", 25),
        new CodeLine("██▄███████████▀▄▄▄▄▀███████████▄██", "#00ffff", 25),
        new CodeLine("█████████████ ██████ █████████████", "#00ffff", 25),
        new CodeLine("██            ██████            ██", "#00ffff", 25),
        new CodeLine("██             ▀▀▀▀             ██", "#00ffff", 25),
        new CodeLine("▀█            ██████▄           ██", "#00ffff", 25),
        new CodeLine(" ██         ▄████████▄         ██ ", "#00ffff", 25),
        new CodeLine("  ██▄      ▄██████████▄      ▄██  ", "#00ffff", 25),
        new CodeLine("   ▀██▄   ▄████████████▄   ▄██▀   ", "#00ffff", 25),
        new CodeLine("     ▀██▄ ▀████████████▀ ▄██▀     ", "#00ffff", 25),
        new CodeLine("       ▀▀██▄▄▄██████▄▄▄██▀▀       ", "#00ffff", 25),
        new CodeLine("           ▀▀▀▀▀▀▀▀▀▀▀▀           ", "#00ffff", 25),
        new CodeLine("______            _        _        _______  _______     _______  _______ ", "#00ffff", 25),
        new CodeLine("(  ___ \\ |\\     /|( (    /|| \\    /\\(  ____ \\(  ____ )   (  ___  )(  ____ \\", "#00ffff", 25),
        new CodeLine("| (   ) )| )   ( ||  \\  ( ||  \\  / /| (    \\/| (    )|   | (   ) || (    \\/", "#00ffff", 25),
        new CodeLine("| (__/ / | |   | ||   \\ | ||  (_/ / | (__    | (____)|   | |   | || (_____ ", "#00ffff", 25),
        new CodeLine("|  __ (  | |   | || (\\ \\) ||   _ (  |  __)   |     __)   | |   | |(_____  )", "#00ffff", 25),
        new CodeLine("| (  \\ \\ | |   | || | \\   ||  ( \\ \\ | (      | (\\ (      | |   | |      ) |", "#00ffff", 25),
        new CodeLine("| )___) )| (___) || )  \\  ||  /  \\ \\| (____/\\| ) \\ \\__ _ | (___) |/\\____) |", "#00ffff", 25),
        new CodeLine("|/ \\___/ (_______)|/    )_)|_/    \\/(_______/|/   \\__/(_)(_______)\\_______)", "#00ffff", 0),
    ]
    
    public async startAudio() {
        await this.waitForMediaLoaded(this.bootUpSound);

        this.bootUpSound.play();

        setTimeout(() => {
            this.coolerSound.play();
        }, 8700)
    }

    private waitForMediaLoaded(mediaElement: HTMLMediaElement): Promise<void> {
        return new Promise((resolve, reject) => {
            if (mediaElement.readyState >= 3) {
                resolve();
            } else {
                mediaElement.addEventListener('canplaythrough', () => resolve(), { once: true });
                mediaElement.addEventListener('error', () => reject(new Error('Media failed to load')), { once: true });
            }
        });
    }
    public async bootUp() {
        this.terminal.dataset.turnedOn = "true";
        for (const code of this.bootSequence) {
            await this.writeLine(code);
        }
        setTimeout(async() => {
            this.lines.innerHTML = "";
            this.startUpSound.play();
            for (const code of this.bunkerOSSequence) {
                await this.writeLine(code, "center");
            }
        }, 1000);
    }
    
    async writeLine(code: CodeLine, justify: string = "start", keyByKey: boolean = false) {
        const newLine = document.createElement('pre');
        newLine.style.color = code.color;
        newLine.style.textShadow = "0 0 10px " + code.color;
        newLine.style.justifySelf = justify;
    
        if (this.lines) {
            this.lines.appendChild(newLine);
            this.lines.scrollTop = this.lines.scrollHeight;
        }
    
        if (keyByKey) {
            for (const char of code.text) {
                newLine.innerText += char;
                await new Promise(resolve => setTimeout(resolve, 20));
            }
        } else {
            newLine.innerText = code.text;
        }
    
        await new Promise(resolve => setTimeout(resolve, code.duration));
    }
    
    
}