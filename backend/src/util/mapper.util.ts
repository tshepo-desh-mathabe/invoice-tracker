import { plainToInstance } from "class-transformer";
import { log } from "node:console";
import { InvoiceDto } from "src/invoice/dto/create-invoice.dto";
import { Invoice } from "src/invoice/entities/invoice.entity";

export class MapperUtil {
  /**
   * Maps DTO to Entity
   */
  static toEntity<T, V extends object>(dto: T, entityClass: new () => V): V {
    const entity = new entityClass();
    Object.assign(entity, dto);
    return entity;
  }

  /**
   * Maps an array of DTOs to Entities
   */
  static toEntityList<T, V extends object>(dtos: T[], entityClass: new () => V): V[] {
    return dtos.map(dto => this.toEntity(dto, entityClass));
  }

  /**
   * Maps Entity to DTO (optional: hide db internal id)
   */
  static toDto<T, V extends object>(entity: T, dtoClass: new () => V, hideId = true): V {
    const dto = new dtoClass();
    Object.assign(dto, entity);

    if (hideId && 'id' in dto) {
      delete (dto as any).id;
    }

    return dto;
  }

  /**
   * Maps an array of Entities to DTOs
   */
  static toDtoList<T, V extends object>(entities: T[], dtoClass: new () => V, hideId = true): V[] {
    return entities.map((entity) => this.toDto(entity, dtoClass, hideId));
  }

  static mappedInvoicesToDto([invoices]) {
    log('HAHAHAH----', invoices)
    return invoices.map(inv => ({
      id: inv.id,
      amount: inv.amount,
      status: inv.status,
      reason: inv.reason,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
      expiresAt: inv.expiresAt,
      transactionDto: {
        trxnReference: inv.transaction?.trxnReference,
        amount: inv.transaction?.amount,
        status: inv.transaction?.status,
        isFinalState: inv.transaction?.isFinalState,
        createdAt: inv.transaction?.createdAt,
        updatedAt: inv.transaction?.updatedAt,
        expiresAt: inv.transaction?.expiresAt,
      },
      clientDto: {
        fullName: inv.client?.fullName,
        email: inv.client?.email,
        phoneNumber: inv.client?.phoneNumber,
      },
      itemsDto: inv.items?.map(item => ({
        sku: item.sku,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })) ?? [],
    }));
  }
}
