export interface BusinessObject {
    id: string,
    owner_id: string,
    type: string,
    name: string,
    currency: Currency
}

export interface User {
    type: string,
    first_name: string,
    last_name: string,
    email: string
}

export interface UserObject extends User {
    id: string,
    business_id: string,
    created_at: string
}

export interface Item {
    name: string,
    description: string,
    type: string,
    image_url: string,
    price: number,
    variant_groups: (VariantGroup | VariantGroupObject)[]
}



export interface ItemObject extends Item {
    id: string,
    business_id: string,
    created_at: string
}

export interface Rule {
    id:string,
    business_id: string,
    created_at: string,
    name: string,
    out_quantity:number,
    input_items:ItemObject[],
    out_item_id:string,
    out_item_variants:string
}

export interface Location {
    name: string,
    address: string,
    city: string,
    state: string,
    country: string,
    latitude: number,
    longitude: number,
    postal_code: string,
    phone_number: string,
    type: string
}

export interface LocationObject extends Location {
    id: string,
    business_id: string,
    created_at: string
}

export interface Variant {
    name: string
}

export interface VariantObject extends Variant {
    id: string,
    created_at: string
}

export interface VariantGroup {
    name: string,
    description: string,
    variants: (Variant | VariantObject)[]
}

export interface VariantGroupObject extends VariantGroup {
    id: string,
    created_at: string
}

export interface InventoryItem {
    item: ItemObject,
    quantity: number,
    variants: { [variant_group_id: string]: string }
}

export interface InventoryItemObject extends InventoryItem {
    id: string
}

export interface OrderItemObject extends InventoryItem {
    id: string,
    unit_price: number
}

export interface Customer {
    first_name: string,
    last_name: string,
    email: string,
    phone_number: string,
    address: string,
    postal_code: string,
    city: string,
    state: string,
    country: string
}

export interface CustomerObject extends Customer {
    id: string,
    business_id: string
}

export interface Order {
    customer_id?: string,
    customer?: Customer,
    currency: string,
    items: InventoryItem[]
}

export interface OrderObject {
    id: string,
    employee: UserObject,
    customer: CustomerObject,
    items: OrderItemObject[]
    status: 'paid',
    currency: string,
    total_items: number,
    subtotal_amount: number,
    total_amount: number,
    tax_rate: number
}

export interface Currency {
    symbol: string,
    name: string,
    symbol_native: string,
    decimal_digits: number,
    rounding: number,
    code: string,
    name_plural: string,
    conversion_rate: number,
    is_prefixed: boolean
}

export interface CurrencyList {
    [currency: string]: Currency
}

export interface LogObject {
    id: string,
    business_id: string,
    severity: 'info' | 'activity' | 'warning' | 'error',
    message: string,
    created_at: string
}

export interface ScheduledShipment {
    location_start: LocationObject,
    location_end: LocationObject,
    type: string,
    date: string,
    time: string,
    timezone: string,
    departed_at: string | null,
    arrived_at: string | null
}

export interface ScheduledShipmentObject extends ScheduledShipment {
    id: string,
    created_at: string,
    updated_at: string
    departure_validated_by: UserObject | null,
    arrival_validated_by: UserObject | null
}
