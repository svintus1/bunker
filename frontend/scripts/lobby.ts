import { AkronymAnimator } from "../akronym/scripts/AkronymAnimator.js";
import { AkronymEventRouter } from "../akronym/scripts/AkronymEventRouter.js";
import * as sequences from "./sequences.js";
export function init({ navigateTo }: { navigateTo: (path: string) => void }): Lobby {
    return new Lobby(navigateTo);
}

interface Command {
    validate?: (args: string[]) => boolean;
    execute?: (args: string[]) => Promise<void>;
    subcommands?: Map<string, Command>;
    errorMsg?: string;
  }

class Lobby {
    private ambientMusic: HTMLAudioElement;
    private musicStatus: HTMLButtonElement;

    private bootUpSound: HTMLAudioElement;
    private startUpSound: HTMLAudioElement;

    public terminal: HTMLDivElement;
    private lines: HTMLDivElement;
    private userInput: HTMLInputElement;

    private cmds = new Map<string, Command>();
    private isCleaningUp: boolean = false;

    constructor(navigateTo: (path: string) => void) {
        this.terminal = document.getElementById('terminal') as HTMLDivElement;
        this.bootUpSound = document.querySelector('audio#boot-up') as HTMLAudioElement;
        this.lines = document.querySelector('#lines') as HTMLDivElement;
        this.startUpSound = document.querySelector('audio#start-up') as HTMLAudioElement;
        this.userInput = document.getElementById('user-input') as HTMLInputElement;
        
        this.musicStatus = document.querySelector('#music-status') as HTMLButtonElement;
        AkronymAnimator.changeVisibility(this.musicStatus, "hidden", 'fade-out', 0);
        

        this.bootUpSound.play();
        setTimeout(() => {
            this.bootUp();
        }, 3000);

        this.ambientMusic = document.getElementById('ambient-music') as HTMLAudioElement;
        this.ambientMusic.src = './static/lobby/terminal-cooler.mp3';
        this.ambientMusic.play();

        this.registerCommands();
    }

    public async bootUp() {
        this.terminal.dataset.turnedOn = "true";
    
        await this.writeCode(sequences.bootSequence);
    
        this.clearTerminal();

        if (!this.isCleaningUp) {
            this.startUpSound.play();
        }

        await this.writeCode(sequences.bunkerOSSequence, false, "center")

        setTimeout(async() => {
            await this.clearTerminal(false);
            await this.hello();
            this.startInteraction();
        }, 3000)
    }

    public async hello() {
        await this.writeCode(sequences.helloSequence, false, undefined, true);
    }

    private registerCommands() {
        // Регистрация команды "kick"
        this.register("kick", {
          validate: (args) => args.length === 1 && !isNaN(Number(args[0])),
          execute: (args) => this.kickPlayer(Number(args[0]))
        });
    
        // Регистрация команды "start"
        this.register("start", {
          validate: (args) => args.length === 0,
          execute: this.startGame.bind(this)
        });
    
        // Регистрация команды "exit"
        this.register("exit", {
          validate: (args) => args.length === 0,
          execute: this.exitLobby.bind(this)
        });
    
        // Регистрация команды "v1"
        this.register("v1", {
          validate: (args) => args.length === 0,
          execute: this.v1.bind(this)
        });
    
        // Регистрация команды "svintus"
        this.register("svintus", {
          validate: (args) => args.length === 0,
          execute: this.svintus.bind(this)
        });

        this.register("help", {
            validate: (args) => args.length === 0,
            execute: this.help.bind(this)
        })

        this.register("users", {
            subcommands: new Map([
                ["show", {
                    validate: args => args.length === 0,
                    execute: this.showUsers.bind(this)
                }]
            ])
        });
    }

    private async showUsers(): Promise<void> {
        this.writeCode(new sequences.Line("[USERS] Список пользователей:", "#00ff00"))
        this.writeCode(new sequences.Line("[USERS] Пользователь #1: admin", "#00ff00"))
    }

    private async help(): Promise<void> {
        this.writeCode(sequences.helpSequence);
    }

    private async startGame(): Promise<void>{
        this.writeCode(new sequences.Line("[INIT] Инициализация протокола запечатывания. Приятного пребывания!", "#00ff00", 2000));
    }

    private async exitLobby(): Promise<void> {
        this.writeCode(new sequences.Line("[ABORT] Инициализация протокола запечатывания отменена. Всего доброго!", "#ffff00", 2000));
    }

    private async svintus(): Promise<void> {
        this.writeCode(new sequences.Line("[SVINTUS] СВИИИИИИНТУС ПРИДЕЕЕЕЕЕЕЕЕТ", "#ff0000", 25));
        this.writeCode(sequences.svintusSequence, true);
    }

    private async v1(): Promise<void> {
        this.writeCode(new sequences.Line("[V1] оооо монетки делают динь-динь", "#ff0000", 25));
        this.writeCode(sequences.v1Sequence, true);
    }

    private async kickPlayer(userNumber: number): Promise<void> {
        if (this.getPlayer(userNumber)) {
            this.writeCode(new sequences.Line(`[USER] Удаляем пользователя #${userNumber}...`, "#ffff00"));
            const request = true; // add real request
            if (request) {
                this.writeCode(new sequences.Line(`[SUCCESS] Пользователь #${userNumber} удалён`, "#00ff00"));
            }
        }
        else {
            const output = new sequences.Line("[ERROR] Пользователь не найден!", "#ff0000")
        }
    }

    private getPlayer(userNumber: number){
        return ('9')
    }
    
    public cleanup(): void {
        // Set the cleanup flag
        this.isCleaningUp = true;
    
        // Stop all audio
        this.bootUpSound.pause();
        this.bootUpSound.currentTime = 0;
    
        this.startUpSound.pause();
        this.startUpSound.currentTime = 0;
    
        this.ambientMusic.pause();
        this.ambientMusic.currentTime = 0;
    
        // Remove event listeners if any were added
        // Example: this.someElement.removeEventListener('event', this.someHandler);
    
        // Clear intervals or timeouts if any
        // Example: clearInterval(this.someIntervalId);
    }

    public async startInteraction() {
        this.lines.style.overflow = "auto";
        AkronymAnimator.changeVisibility(this.userInput.parentElement, "visible", "fade-in", 0)
        AkronymEventRouter.add(document, "keydown", (event: Event) => {
            const keyboardEvent = event as KeyboardEvent;
            if (keyboardEvent.key === "Enter") {
                const input = this.userInput.value;
                this.writeCode(new sequences.Line("> " + input, "#00ff00", 0));
                this.run(input);
                this.userInput.value = "";
                this.lines.scrollTop = this.lines.scrollHeight;
            }
        })
    }

    register(name: string, cmd: Command) {
        this.cmds.set(name, cmd);
    }
  
    async run(cmdLine: string) {
        const parts = cmdLine.trim().split(/\s+/);
        let cmd = this.cmds.get(parts[0]);
        let args = parts.slice(1);
      
        while (cmd?.subcommands && args.length) {
          const sub = cmd.subcommands.get(args[0]);
          if (!sub) break;
          cmd = sub;
          args = args.slice(1);
        }
      
        if (!cmd?.execute || !cmd.validate?.(args)) {
          const msg = cmd ? "[ERROR] Некорректные параметры" : "[ERROR] Неизвестная команда";
          return this.writeCode(new sequences.Line(msg, "#ff0000"));
        }
      
        await cmd.execute(args);
      }
    
    async clearTerminal(instant: boolean = true) {
        const userInput = this.lines.lastElementChild;
        if (instant) {
            this.lines.innerHTML = "";
            if (userInput) this.lines.appendChild(userInput);
            return;
        }
    
        // постепенно снизу-вверх, не трогая последний элемент
        while (this.lines.children.length > 1) {
            const idx = this.lines.children.length - 2;
            const node = this.lines.children[idx] as HTMLElement;
    
            if (node.children.length > 0) {
                // внутри обёртки: удаляем последний вложенный элемент
                node.removeChild(node.children[node.children.length - 1]);
            } else {
                // пустая обёртка или обычная строка: удаляем саму ноду
                this.lines.removeChild(node);
            }
    
            await new Promise(resolve => setTimeout(resolve, 25));
        }
    }
    
    
    
    
    async writeCode(code: sequences.Line | sequences.Line[], isSmallASCIIArt: boolean = false, align: string | undefined = undefined, keyByKey: boolean = false) {
        if (this.isCleaningUp) return;
    
        const linesToWrite = Array.isArray(code) ? code : [code];
        let wrapper: HTMLElement | null = null;
    
        if (align != undefined || isSmallASCIIArt) {
            wrapper = document.createElement('div');
            if (align) {
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.alignItems = align;
            }
    
            if (isSmallASCIIArt) {
                wrapper.style.fontSize = '6px';
            }
    
            if (this.lines) {
                this.lines.insertBefore(wrapper, this.userInput.parentElement);
            }
        }
    
        for (const Line of linesToWrite) {
            let newLine: HTMLPreElement;
    
            if (Line.overwrite && this.lines?.lastElementChild) {
                newLine = this.lines.children[-2] as HTMLPreElement;
                newLine.innerText = "";
                newLine.style.color = Line.color;
                newLine.style.textShadow = "0 0 10px " + Line.color;
            } else {
                newLine = document.createElement('pre');
                newLine.style.color = Line.color;
                newLine.style.textShadow = "0 0 10px " + Line.color;
                if (align != undefined) {
                    newLine.style.alignSelf = align;
                }
    
                if (wrapper) {
                    wrapper.appendChild(newLine);
                } else {
                    if (this.lines) {
                        this.lines.insertBefore(newLine, this.userInput.parentElement);
                    }
                }
            }
            this.lines.scrollTop = this.lines.scrollHeight;
    
            if (keyByKey) {
                for (const char of Line.text) {
                    if (this.isCleaningUp) return;
                    newLine.innerText += char;
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            } else {
                newLine.innerText = Line.text;
            }

            if (Line.duration !== 0) {
                await new Promise(resolve => setTimeout(resolve, Line.duration));
            }
        }
    }
}

