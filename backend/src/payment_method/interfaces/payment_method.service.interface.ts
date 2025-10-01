import { MethodType } from "src/util/constans";
import { PaymentMethodDto } from "../dto/create-payment_method.dto";
import { PaymentMethod } from "../entities/payment_method.entity";

/**
 * Abstract service definition for managing Payment Methods.
 * 
 * This interface enforces a contract that any concrete service
 * implementing it must provide implementations for retrieving
 * all payment methods and retrieving one by its name.
 */
export abstract class IPaymentMethodService {

    /**
     * Fetch all available payment methods.
     * 
     * @returns Promise that resolves to a list of PaymentMethodDto objects.
     *          These are DTOs, so they only expose safe fields to consumers.
     */
    abstract findAll(): Promise<PaymentMethodDto[]>;

    /**
     * Find a payment method entity by its name.
     * 
     * @param name - The name of the payment method (string, typically matches an enum value).
     * @returns Promise that resolves to the PaymentMethod entity.
     *          Throws an error if the method is not found.
     */
    abstract findByName(name: MethodType): Promise<PaymentMethod>;
}
