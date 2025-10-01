import { CreateClientDto, ClientDto } from "src/client/dto/create-client.dto";
import { Client } from "../entities/client.entity";

/**
 * Interface defining the contract for ClientService.
 * All methods should be implemented by any service managing clients.
 */
export abstract class IClientService {

    /**
     * Creates a new client if it does not exist.
     * If a client with the same email already exists, returns a message indicating so.
     * 
     * @param dto - Data transfer object containing client information
     * @returns A string message confirming creation or existence
     */
    abstract create(dto: CreateClientDto): Promise<string>;

    /**
     * Finds a client by their email address.
     * Throws an exception if the client is not found.
     * 
     * @param email - The email of the client to search for
     * @returns client entity
     */
    abstract findByEmail(email: string): Promise<Client>;

    /**
     * Finds clients by either email or phone number using a partial match.
     * Supports case-insensitive SQL LIKE search.
     * 
     * @param term - The search term
     * @param flag - 'EMAIL' to search by email, 'PHONE_NUMBER' to search by phone number
     * @returns Array of ClientDto objects matching the search criteria
     */
    abstract findByEmailOrPhone(term: string, flag: 'EMAIL' | 'PHONE_NUMBER'): Promise<ClientDto[]>;
}
