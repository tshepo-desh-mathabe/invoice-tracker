import { Configuration } from "../entities/configuration.entity";

/**
 * Abstract service class for managing configurations.
 * Defines the contract that any concrete ConfigurationService
 * should implement.
 */
export abstract class IConfigurationService {

    /**
     * Fetch a configuration by its unique name.
     * Implementations should handle caching or database access.
     * 
     * @param name - The unique name of the configuration
     * @param defaultValue - The value to fallback to when nothing is return from DB/cache
     * @returns A Promise resolving to the Configuration entity
     * @throws Error if configuration with the given name is not found
     */
    abstract getByName(name: string, defaultValue: string): Promise<Configuration>;
}
