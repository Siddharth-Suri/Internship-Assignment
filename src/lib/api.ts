export type Artwork = {
    id: number
    place_of_origin: string
    artist_display: string
    inscriptions: string | null
    date_start: string
    date_end: string
}

export type DataResponse = {
    data: Artwork[]
    pagination: {
        total: number
    }
}

// Calls the api with page and limit values which later returns the values to the component
export async function callApi(
    page: number,
    size: number
): Promise<DataResponse> {
    const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${size}`
    const res = await fetch(url)
    const data: DataResponse = await res.json()
    return data
}
