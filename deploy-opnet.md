// CatBank.ts - Смарт-контракт для PillBank

import { Contract, OP_20 } from '@opnet/sdk'; // Импорт из OP_NET SDK (установи через npm)

class CatBank extends Contract {
    // Токен YARA как OP_20
    private yaraToken: OP_20;

    constructor() {
        super();
        this.yaraToken = new OP_20('YARA', 'YARA', 18, 250000000); // Название, символ, decimals, total supply
    }

    // Функция минтинга (добавить пилюли)
    public mint(amount: bigint, to: string): void {
        this.yaraToken.mint(to, amount);
        console.log(`Minted ${amount} YARA to ${to}`);
    }

    // Функция стейкинга (спрятать в копилку)
    public stake(amount: bigint, from: string): void {
        this.yaraToken.transfer(from, this.address, amount); // Перевод в контракт
        console.log(`Staked ${amount} YARA from ${from}`);
    }

    // Получить баланс
    public getBalance(address: string): bigint {
        return this.yaraToken.balanceOf(address);
    }
}

// Экспорт для деплоя
export default CatBank;
