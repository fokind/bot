import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import { AccountService } from "../service/AccountService";
import { Balance } from "./Balance";

export class Account {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public exchange: string;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Balance)))
    public Balance: Balance;

    constructor(data: any) {
        Object.assign(this, data);
    }

    @Edm.Action
    public async makeDeposit(
        @odata.result result: any,
        @odata.body
        body: {
            currency: string;
            quantity: number;
        }
    ): Promise<void> {
        return await AccountService.makeDeposit(result._id, body);
    }

    // createOrder
    // создается ордер, изменяется баланс
    // ордер должен исполнится, если цена подходящая
    // при исполнении ордера создается трейд и меняется баланс
    // список ордеров можно получить
    // ордеры можно удалить, это повлияет на баланс
    // трейды можно получить списком
    // трейды удалить нельзя
    // более сложные операции не выполняются
    // должен ли баланс храниться в базе данных? если он может быть получен суммой операций
    // может ли баланс изменяться напрямую
}
