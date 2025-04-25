import { AkronymAnimator } from "../akronym/scripts/AkronymAnimator.js";
import { AkronymEventRouter } from "../akronym/scripts/AkronymEventRouter.js";
export function init({ navigateTo }: { navigateTo: (path: string) => void }): Lobby {
    return new Lobby(navigateTo);
}

class CodeLine {
    public text: string;
    public color: string;
    public duration: number;
    public overwrite: boolean;

    constructor(text: string, color: string, duration: number = 0, overwrite: boolean = false) {
        this.text = text;
        this.color = color;
        this.duration = duration;
        this.overwrite = overwrite;
    }
}

class Lobby {
    public page: any;
    public terminal: HTMLDivElement;
    private bootUpSound: HTMLAudioElement;
    private startUpSound: HTMLAudioElement;
    private lines: HTMLDivElement;
    private userInput: HTMLInputElement;

    private ambientMusic: HTMLAudioElement;
    private musicStatus: HTMLButtonElement;

    private async execute(cmd: string) {
        const parts = cmd.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
    
        if (command === "kick") {
            if (args.length !== 1) {
                this.writeLine(new CodeLine("[ERROR] Некорректное количество параметров", "#ff0000"));
                return;
            }
            if (isNaN(Number(args[0]))) {
                this.writeLine(new CodeLine("[ERROR] Некорректный параметр", "#ff0000"));
                return;
            }
            this.kickPlayer(Number(args[0]));
            return;
        }
    
        if (command === "start") {
            if (args.length !== 0) {
                this.writeLine(new CodeLine("[ERROR] Команда 'start' не принимает параметры", "#ff0000"));
                return;
            }
            this.writeLine(new CodeLine("[INIT] Инициализация протокола запечатывания. Приятного пребывания!", "#00ff00", 2000));
            this.startGame();
            return;
        }
    
        if (command === "exit") {
            if (args.length !== 0) {
                this.writeLine(new CodeLine("[ERROR] Команда 'exit' не принимает параметры", "#ff0000"));
                return;
            }
            this.writeLine(new CodeLine("[ABORT] Инициализация протокола запечатывания отменена. Всего доброго!", "#ffff00", 2000));
            this.exitLobby();
            return;
        }

        if (command === "v1") {
            if (args.length !== 0) {
                this.writeLine(new CodeLine("[ERROR] Команда 'v1' не принимает параметры", "#ff0000", 25));
                return;
            }
            this.writeLine(new CodeLine("[V1] оооо монетки делают динь-динь", "#ff0000", 25));
            for (const code of this.v1Sequence) {
                if (this.isCleaningUp) return; // Stop execution if cleaning up
                await this.writeLine(code, true);
            }
            return;
        }

        if (command === "svintus") {
            if (args.length !== 0) {
                this.writeLine(new CodeLine("[ERROR] Команда 'svintus' не принимает параметры", "#ff0000", 25));
                return;
            }
            this.writeLine(new CodeLine("[SVINTUS] СВИИИИИИНТУС ПРИДЕЕЕЕЕЕЕЕЕТ", "#ff0000", 25));
            for (const code of this.svintusSequence) {
                if (this.isCleaningUp) return; // Stop execution if cleaning up
                await this.writeLine(code, true);
            }
            return;
        }
    
        this.writeLine(new CodeLine("[ERROR] Неизвестная команда", "#ff0000"));
    }
    
    private startGame() {

    }

    private exitLobby() {

    }

    private kickPlayer(userNumber: number) {
        if (this.getPlayer(userNumber)) {
            this.writeLine(new CodeLine(`[USER] Удаляем пользователя #${userNumber}...`, "#ffff00"));
            const request = true; // add real request
            if (request) {
                this.writeLine(new CodeLine(`[SUCCESS] Пользователь #${userNumber} удалён`, "#00ff00"));
            }
            return true;
        }
        else {
            const output = new CodeLine("[ERROR] Пользователь не найден!", "#ff0000")
            return false;
        }
    }

    private getPlayer(userNumber: number){
        return ('9')
    }

    constructor(navigateTo: (path: string) => void) {
        this.terminal = document.getElementById('terminal') as HTMLDivElement;
        this.bootUpSound = document.querySelector('audio#boot-up') as HTMLAudioElement;
        this.lines = document.querySelector('#lines') as HTMLDivElement;
        this.startUpSound = document.querySelector('audio#start-up') as HTMLAudioElement;
        this.userInput = document.getElementById('user-input') as HTMLInputElement;
        
        this.musicStatus = document.querySelector('#music-status') as HTMLButtonElement;
        AkronymAnimator.changeVisibility(this.musicStatus, "hidden", 'fade-out', 0)

        this.bootUpSound.play();
        setTimeout(() => {
            this.bootUp();
        }, 3000);

        this.ambientMusic = document.getElementById('ambient-music') as HTMLAudioElement;
        this.ambientMusic.src = './static/lobby/terminal-cooler.mp3';
        this.ambientMusic.play();
    }

    public async startInteraction() {
        this.lines.style.overflow = "auto";
        AkronymAnimator.changeVisibility(this.userInput.parentElement, "visible", "fade-in", 0)
        AkronymEventRouter.add(document, "keydown", (event: Event) => {
            const keyboardEvent = event as KeyboardEvent;
            if (keyboardEvent.key === "Enter") {
                this.writeLine(new CodeLine("> " + this.userInput.value, "#00ff00", 0));
                this.execute(this.userInput.value);
                this.userInput.value = "";
            }
        })
    }

    public async bootUp() {
        this.terminal.dataset.turnedOn = "true";
    
        // for (const code of this.bootSequence) {
        //     if (this.isCleaningUp) return; // Stop execution if cleaning up
        //     await this.writeLine(code);
        // }
    
        // this.cleanTerminal();

        // if (!this.isCleaningUp) {
        //     this.startUpSound.play();
        // }
    
        // for (const code of this.bunkerOSSequence) {
        //     if (this.isCleaningUp) return; // Stop execution if cleaning up
        //     await this.writeLine(code, false, "center");
        // }
        // setTimeout(() => {
        //     this.cleanTerminal();
        //     this.startInteraction();
        // }, 3000)
        this.startInteraction();
    }
    private isCleaningUp: boolean = false;
    
    public cleanTerminal() {
        const userInput = this.lines.lastElementChild;
        this.lines.innerHTML = "";
        if (userInput) this.lines.appendChild(userInput);
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
    
    async writeLine(code: CodeLine | CodeLine[], isSmallASCIIArt: boolean = false, align: string | undefined = undefined, keyByKey: boolean = false) {
        if (this.isCleaningUp) return; // Stop execution if cleaning up
    
        // Обработаем, если передан массив CodeLine
        const linesToWrite = Array.isArray(code) ? code : [code];
        let wrapper: HTMLElement | null = null;
    
        // Создаем обертку, если указан align или isSmallASCIIArt
        if (align || isSmallASCIIArt) {
            wrapper = document.createElement('div');
            if (align) {
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.alignItems = align;
            }
    
            if (isSmallASCIIArt) {
                wrapper.style.fontSize = '6px';
            }
    
            // Вставляем wrapper в родительский элемент
            if (this.lines) {
                this.lines.insertBefore(wrapper, this.userInput.parentElement);
            }
        }
    
        for (const codeLine of linesToWrite) {
            let newLine: HTMLPreElement;
    
            if (codeLine.overwrite && this.lines?.lastElementChild) {
                // Use the last line if overwrite is true
                newLine = this.lines.children[-2] as HTMLPreElement;
                newLine.innerText = ""; // Clear the content of the last line
                newLine.style.color = codeLine.color;
                newLine.style.textShadow = "0 0 10px " + codeLine.color;
            } else {
                // Create a new line
                newLine = document.createElement('pre');
                newLine.style.color = codeLine.color;
                newLine.style.textShadow = "0 0 10px " + codeLine.color;
                if (align != undefined) {
                    newLine.style.alignSelf = align;
                }
    
                if (wrapper) {
                    wrapper.appendChild(newLine); // Add the new line to the wrapper
                } else {
                    if (this.lines) {
                        this.lines.insertBefore(newLine, this.userInput.parentElement);
                    }
                }
            }
    
            if (keyByKey) {
                for (const char of codeLine.text) {
                    if (this.isCleaningUp) return; // Stop execution if cleaning up
                    newLine.innerText += char;
                    await new Promise(resolve => setTimeout(resolve, 20));
                }
            } else {
                newLine.innerText = codeLine.text; // Replace the content of the line
            }
    
            // Delay if specified in this line
            if (codeLine.duration !== 0) {
                await new Promise(resolve => setTimeout(resolve, codeLine.duration));
            }
        }
    
        this.lines.scrollTop = this.lines.scrollHeight;
    }
    

    private bootSequence: CodeLine[] = [
        ///// ФАЗА 1: СТАНДАРТНАЯ ИНИЦИАЛИЗАЦИЯ /////
        new CodeLine(">> [BOOT] BunkerOS v7.4.0-Ψ3 ИНИЦИАЛИЗАЦИЯ...", "#00ff00", 400),
        new CodeLine(">> BIOS: CRYPTECH SECURE BOOT v4.2", "#00ff00", 30),
        new CodeLine(">> MEMTEST: 8743MB OK | 32MB РЕЗЕРВИРОВАНО", "#00ff00", 30),
        new CodeLine(">> Монтирование /dev/core/bsys [ЗАШИФРОВАНО LUKS]", "#00ff00", 40),
        new CodeLine(">> [!] НЕОЖИДАННЫЙ ХЭШ В /boot/vmlinuz-3.2.1", "#ffff00", 200),
        new CodeLine(">> ПОДТВЕРЖДЕНИЕ [АУТЕНТИФИКАЦИЯ: BIOS_RECOVERY]", "#00ff00", 80),
    
        ///// ФАЗА 2: ПРОВЕРКА СИСТЕМ ЖИЗНЕОБЕСПЕЧЕНИЯ /////
        new CodeLine(">> ИНИЦИАЛИЗАЦИЯ МОНИТОРА СИСТЕМЫ ЖИЗНЕОБЕСПЕЧЕНИЯ...", "#00ffff", 50),
        new CodeLine(">> УРОВЕНЬ O2: 21.3% (+-0.5% отклонение)", "#00ff00", 30),
        new CodeLine(">> СОКРЫТИЕ CO2: 78% ЭФФЕКТИВНОСТЬ", "#ffff00", 30),
        new CodeLine(">> КРИОГЕННАЯ СИСТЕМА:", "#00ff00", 40),
        new CodeLine(">> ПОД #01: ОПЕРАЦИОНЕН (-112°C)", "#00ff00", 30),
        new CodeLine(">> ПОД #02: УМЕНЬШЕНА ЭФФЕКТИВНОСТЬ (ТЕПЛОВОЕ ОТКЛОНЕНИЕ +3°C)", "#ffff00", 30),
        new CodeLine(">> ПОД #03: ОФФЛАЙН [ПОСЛЕДНЯЯ СОСТОЯНИЕ: НЕУДАЧНОЕ ПЛОМБИРОВАНИЕ]", "#ff0000", 400),
        new CodeLine(">> ПРЕДУПРЕЖДЕНИЕ: ПРОЛОМ СОДЕРЖАНИЯ БИОПРИМЕРОВ ПОДА #03", "#ff0000", 300),
        new CodeLine(">> ПРОТОКОЛ АВТОКАРАНТИНА АКТИВИРОВАН", "#ffff00", 150),
    
        ///// ФАЗА 3: ЗАГРУЗКА КРИТИЧЕСКИХ СИСТЕМ /////
        new CodeLine(">> ЗАГРУЗКА СИСТЕМЫ БЕЗОПАСНОСТИ...", "#00ff00", 60),
        new CodeLine(">> BLACK ICE ПРОШИВКА v2.1.3 ВКЛЮЧЕНА", "#00ffff", 40),
        new CodeLine(">> ДАТЧИКИ ДВИЖЕНИЯ: 142/144 АКТИВНЫЕ", "#00ff00", 30),
        new CodeLine(">> [!] ДАТЧИК X-12/Y-88: ПОСТОЯННО ОФФЛАЙН", "#ffff00", 80),
        new CodeLine(">> СКАНИРОВАНИЕ СИСТЕМ:", "#00ff00", 50),
        new CodeLine(">> РАДИАЦИОННЫЙ ЩИТ: 98% ЦЕЛОСТНОСТЬ", "#00ff00", 30),
        new CodeLine(">> АИРОЛОКИ: ПЕРВИЧНЫЙ/ ВТОРИЧНЫЙ/ ТРЕТИЧНЫЙ ОК", "#00ff00", 30),
        new CodeLine(">> ГИДРОПОНИКА: 73% ОПЕРАЦИОНАЛЬНО", "#ffff00", 40),
        new CodeLine(">> ИИ ЯДРО: НЕОЖИДАННАЯ ПРОШИВКА", "#ff0000", 300),
    
        ///// ФАЗА 4: АНОМАЛИИ И СБОИ /////
        new CodeLine(">> [!] ПОРОЖДЕНИЕ В /dev/mem/0xFA404", "#ff0000", 100),
        new CodeLine(">> ВОССТАНОВЛЕНИЕ ФРАГМЕНТА ПАМЯТИ:", "#ffff00", 50),
        new CodeLine(">> '...тепловое событие в секторе Гамма...'", "#aaaaaa", 200),
        new CodeLine(">> ПОПЫТКА ПЕРЕРАЗМЕЩЕНИЯ ПАМЯТИ...", "#ffff00", 40),
        new CodeLine(">> ПРЕДУПРЕЖДЕНИЕ: 47 НЕИСПРАВНЫХ СЕКТОРОВ", "#ff0000", 150),
        new CodeLine(">> ПЕРЕХОД НА РЕДУНДАНТНЫЙ КОНТРОЛЛЕР", "#00ff00", 80),
    
        ///// ФАЗА 5: ЗАГРУЗКА ДАННЫХ /////
        new CodeLine(">> РАСКОДИРОВКА АРХИВА 'ATLAS'...", "#00ffff", 70),
        new CodeLine(">> КАРТА СЕКТОРОВ:", "#00ff00", 30),
        new CodeLine(">> СЕКТОР A1: ████████████████████ 100%", "#00ff00", 30),
        new CodeLine(">> СЕКТОР B2: ████████████         64%", "#ffff00", 40),
        new CodeLine(">> СЕКТОР G7:                      0%", "#ff0000", 50),
        new CodeLine(">> ОШИБКА: GEODATA CRC НЕСООТВЕТСТВИЕ В СЕКТОРЕ B2", "#ff0000", 200),
        new CodeLine(">> ОШИБКА: GEODATA CRC НЕСООТВЕТСТВИЕ В СЕКТОРЕ G7", "#ff0000", 200),
        new CodeLine(">> ПЕРЕХОД НА ЛОКАЛЬНЫЙ КЕШ...", "#ffff00", 80),
        new CodeLine(">> УСПЕШНО...", "#00ff00", 80),
    
        ///// ФАЗА 6: АКТИВАЦИЯ ЗАЩИТНЫХ СИСТЕМ /////
        new CodeLine(">> АКТИВАЦИЯ ПРОТОКОЛОВ ЗАЩИТЫ...", "#00ffff", 60),
        new CodeLine(">> АВТО-ГЕНЕРАТОРЫ: КАЛИБРОВКА...", "#00ff00", 40),
        new CodeLine(">> НЕЙРОТОКСИННЫЙ ГЕНЕРАТОР: ОЖИДАНИЕ", "#ffff00", 50),
        new CodeLine(">> [!] ПОДСИСТЕМА X24: НЕАВТОРИЗОВАННЫЙ ДОСТУП", "#ff0000", 300),
        new CodeLine(">> ПРОТОКОЛ УДЕРЖАНИЯ 'ЖЕЛЕЗНЫЙ ЗАНАВЕС' АКТИВИРОВАН", "#ff0000", 150),
        new CodeLine(">> ОШИБКА: ЩИТ ГЕНЕРАТОР ОФФЛАЙН", "#ff0000", 200),
        new CodeLine(">> ПЕРЕХОД НА РУЧНОЙ ОВЕРРАЙД...", "#ffff00", 100),
    
        ///// ФАЗА 7: ЛОГИ И АРТЕФАКТЫ /////
        new CodeLine(">> РАСКОДИРОВКА НАСЛЕДСТВЕННЫХ СООБЩЕНИЙ...", "#888888", 120),
        new CodeLine(">> LOG_ENTRY 3421: 'Они так и не починили радиатор...'", "#aaaaaa", 200),
        new CodeLine(">> ПОДПИСЬ: ТЕХ_ОФИЦЕР_█▓  [ДОСТУП ЗАКРЫТ]", "#555555", 100),
        new CodeLine(">> АУДИОЛОГ: '...Я НЕ МОГУ ТАК БОЛЬШЕ...'", "#888888", 250),
        new CodeLine(">> НЕИЗВЕСТНЫЙ ФОРМАТ ДАННЫХ: 0xDEADFADE:BEEFCAFE", "#ff0000", 80),
        new CodeLine(">> СОПОСТАВЛЕНИЕ С ПРЕДЫДУЩИМИ ИНЦИДЕНТАМИ...", "#ffff00", 150),
    
        ///// ФАЗА 8: ФИНАЛЬНЫЙ СТАТУС /////
        new CodeLine(">> СТАТУС СИСТЕМЫ: ОПЕРАЦИОНАЛЬНО [С ОШИБКАМИ]", "#ffff00", 200),
        new CodeLine(">> АКТИВНЫЕ АНОМАЛИИ: 14 КРИТИЧЕСКИХ, 27 ПРЕДУПРЕЖДЕНИЙ", "#ff0000", 150),
        new CodeLine(">> СТАТУС БЕЗОПАСНОСТИ: КОМПРОМЕТИРОВАН [ТИП 3]", "#ff0000", 200),
        new CodeLine(">> РЕКОМЕНДУЕМОЕ ДЕЙСТВИЕ: НЕОБХОДИМА МАНУАЛЬНАЯ ПРОВЕРКА", "#ff0000", 300),
        new CodeLine(">> ЗАВЕРШЕНИЕ ЗАГРУЗКИ", "#00ff00", 100),
    
        ///// ФАЗА 9: ФОНТАННЫЕ ПРОЦЕССЫ /////
        new CodeLine(">> [ФОН] ОБНАРУЖЕН ПРОЦЕСС-СПУТНИК", "#555555", 80),
        new CodeLine(">> НЕЗАРЕГИСТРИРОВАННАЯ СУЩНОСТЬ В ВЕНТИЛЯЦИОННОМ ШАХТЕ 4B", "#ff0000", 120),
        new CodeLine(">> ТЕПЛОВАЯ АНОМАЛИЯ: КОМНАТА X-12/Y-88 (+3.7°C)", "#ffff00", 100),
        new CodeLine(">> АВТОМАТИЧЕСКАЯ ПРОЧИСТКА ЗАПЛАНИРОВАНА [ОЖИДАЕМЫЙ ВРЕМЕННОЙ ОКНО 47Ч 59М]", "#00ff00", 200),
        new CodeLine(">> ПРЕДУПРЕЖДЕНИЕ: НЕИЗВЕСТНЫЙ ПРОЦЕСС ДОСТУПАЕТСЯ К КАМЕРАМ", "#ff0000", 150),
        new CodeLine(">> ПОСЛЕДНЕЕ СООБЩЕНИЕ: '...они в стенах...'", "#aaaaaa", 300),
        new CodeLine(">> СИСТЕМА ГОТОВА", "#00ff00", 500),
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

    private v1Sequence: CodeLine[] = [
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠈⡜⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠊⠀⠐⡼⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠊⠀⠀⢀⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⢸⠅⢠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⡰⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠈⡑⠀⠀⠂⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠃⠀⠀⠀⠑⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠈⠀⠀⠀⠀⡐⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠠⠀⠀⠀⠈⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣼⡎⠀⠀⠀⠀⠠⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢄⠀⠀⠀⠀⢰⣶⣤⣤⣦⣶⣖⣶⣶⣶⣶⣶⣆⠀⠀⠀⠀⢠⣾⣿⣿⡃⠀⠀⠀⡐⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⢸⣿⣿⢻⡏⠉⢻⣿⣿⣿⣿⣿⣧⠀⠀⠀⠀⢸⣿⣿⣿⡁⠀⡠⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠠⠀⠂⠀⠌⡦⠁⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⢸⣿⣿⣿⣷⣶⣾⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀⢸⣿⣿⡿⠂⠔⠀⠀⣀⣀⡀⠀⡀⠀⠠⠀⠂⠀⠈⠀⠀⠀⠀⠀⣀⡼⠜⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⢖⡀⠠⠄⠀⠀⠀⠀⣀⠀⠀⠀⠀⢀⣀⠀⠈⠂⢹⣿⣿⣿⣟⣽⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀⢸⣿⣿⡆⠊⣰⣾⣿⢿⡽⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠄⠒⠉⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠦⢀⡀⠀⠀⠀⠀⠀⠀⠈⠁⠀⢿⣿⣿⣾⣤⢸⣿⣿⡿⠟⠛⣻⣿⡿⠃⠀⠀⠀⠀⠀⠀⢹⣿⣿⠃⣸⣿⣿⣿⡟⠀⠀⠀⠀⠀⢀⡀⠠⠒⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠁⠀⠂⠄⠀⡀⠀⠀⠀⠀⢻⣿⣿⣷⣦⣹⣿⣟⣴⣶⣿⣿⣻⣿⣷⣤⣤⣴⣶⣶⣿⣿⣁⣼⣿⣿⡿⠏⠀⢀⠀⠄⠂⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠐⠠⠀⢙⣻⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠄⠂⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⡀⢸⣿⣿⣿⡿⣽⣯⢿⣸⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⡿⠟⠋⢀⣠⣴⣿⣶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢴⡿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣯⢿⣿⢛⣭⣿⣿⣿⣿⣿⣿⣿⣷⣤⣾⣿⣿⣿⣿⣿⡟⠞⠛⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠁⠀⠈⠙⠻⡿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠛⠟⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠄⠐⠁⠀⠀⠀⠀⠀⢀⠠⠄⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠙⢿⣿⣽⣿⣁⡀⣀⠀⠈⠐⠀⠀⠄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠂⠀⢀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⢀⡀⡔⠀⠀⠀⠀⢀⠠⠀⠐⠈⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣷⣥⠄⠀⠀⠀⠈⠐⠀⠠⠄⡀⠀⠀⠀⠀⠀⠀⠐⢀⠀⡀⠀", "#00ffff"),
        new CodeLine("⠀⠈⠘⠂⠒⠉⠀⠀⠀⠀⠀⠀⠀⠀⣾⡟⠿⢿⣿⣿⣿⡟⢹⣿⣿⣿⣿⣿⣿⣿⣿⣄⠀⣿⣿⣿⣿⠏⠛⢿⣿⢿⣿⣟⣯⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠐⠀⠠⠄⡢⡬⠞⠉⠁", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠀⠀⠀⣰⠱⣿⣿⠁⢸⣿⣿⣿⣿⣿⣿⣿⣿⠋⢀⡼⢉⣿⣿⠀⠐⢀⠀⠀⠀⠀⠀⠃⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠈⠀⠀⠀⡠⣿⢹⣷⢇⣴⣾⣿⣿⣿⣿⣿⣿⣿⣯⣴⣾⣗⢮⡿⡟⠀⠀⠀⠐⠀⠀⠀⠀⠀⠐⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠁⠀⠀⢀⠐⠁⡿⣾⣿⣾⢻⣿⣿⣿⣿⣿⣿⣿⣿⢟⣿⣿⡏⣼⣷⡇⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠐⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠔⠀⠀⢀⠄⠁⠀⠀⡧⣿⣿⡧⣟⣯⣿⣿⣿⣿⣿⣿⢏⢞⣿⣿⡇⣽⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⢀⠊⠀⢀⠔⠁⠀⠀⠀⠀⣟⣿⠙⣷⣯⣿⢿⣿⣿⣿⣿⣟⡾⣞⣿⣿⣓⣾⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠀⠀⠡⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⡤⢀⢄⠔⠁⠀⠀⠀⠀⠀⣴⣿⣿⡀⢹⣾⣽⣿⣻⣿⡿⣿⢾⣽⣻⣿⣿⣿⣾⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢄⠀⠀⠈⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⠁⠘⣷⡿⣟⣿⣿⡇⣿⣟⡾⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⢀⠀⠀⠓⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀⢹⣿⣿⣿⣿⠀⣿⣯⢿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠊⠁⠮⠵⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡿⠀⠀⠀⠘⣷⣿⣿⡟⠀⣿⣟⣿⣿⡿⢸⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠁⠀⠀⠀⠀⢹⣿⣿⣧⣀⣹⣿⣿⣿⡿⣾⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⣿⣿⣿⣿⣿⣿⣿⣿⡏⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⢿⣿⣿⣿⣟⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢿⣿⣿⣿⣿⣿⣻⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⢿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⠸⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⠀⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⠀⢹⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣈⣿⣿⡆⠈⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣷⣷⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠿⣿⣿⣿⠿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff"),
        new CodeLine("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠙⠛⠿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "#00ffff")
    ];

    private svintusSequence: CodeLine[] = [
        new CodeLine("         _________              ", "#00ffff"),
        new CodeLine("         ',_`\"\"\\        .---,", "#00ffff"),
        new CodeLine("            \\   :-\"\"``/`    |", "#00ffff"),
        new CodeLine("             `;'     //`\\   /", "#00ffff"),
        new CodeLine("             /   __     |   ('.", "#00ffff"),
        new CodeLine("            |_ ./O)\\     \\  `) \\", "#00ffff"),
        new CodeLine("           _/-.    `      `\"`  |`-.", "#00ffff"),
        new CodeLine("       .-=; `                  /   `-.", "#00ffff"),
        new CodeLine("      /o o \\   ,_,           .        '.", "#00ffff"),
        new CodeLine("      L._._;_.-'           .            `'-.", "#00ffff"),
        new CodeLine("        `'-.`             '                 `'-.", "#00ffff"),
        new CodeLine("            `.         '                        `-._", "#00ffff"),
        new CodeLine("              '-._. -'                              '.", "#00ffff"),
        new CodeLine("                 \\                                    \\", "#00ffff"),
        new CodeLine("                  |                                     \\", "#00ffff"),
        new CodeLine("                  |    |                                 ;   _.", "#00ffff"),
        new CodeLine("                  \\    |           |                     |-.((", "#00ffff"),
        new CodeLine("                   ;.  \\           /    /                |-.`\\)", "#00ffff"),
        new CodeLine("                   | '. ;         /    |                 |(_) )", "#00ffff"),
        new CodeLine("                   |   \\ \\       /`    |                 ;'--'", "#00ffff"),
        new CodeLine("                    \\   '.\\    /`      |                /", "#00ffff"),
        new CodeLine("                     |   /`|  ;        \\               /", "#00ffff"),
        new CodeLine("                     |  |  |  |-._      '.           .'", "#00ffff"),
        new CodeLine("                     /  |  |  |__.`'---\"_;'-.     .-'", "#00ffff"),
        new CodeLine("                    //__/  /  |    .-'``     _.-'`", "#00ffff"),
        new CodeLine("                  jgs     //__/   //___.--''`", "#00ffff")
    ];
}

