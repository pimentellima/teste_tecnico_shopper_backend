export interface MeasureDTO {
    measure_uuid: string
    measure_datetime: string
    image_url: string
    has_confirmed: boolean
    measure_value: string
    customer_code: string
    measure_type: "WATER" | "GAS"
}