import { useState, useEffect, useRef } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { OverlayPanel } from "primereact/overlaypanel"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { callApi } from "../lib/api"
import type { Artwork } from "../lib/api"

export default function PaginatedSelectableTable() {
    const [artworks, setArtworks] = useState<Artwork[]>([])
    const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([])
    const [page, setPage] = useState<number>(1)
    const [rows, setRows] = useState<number>(6) // default value is 6 items mapped at a time
    const [totalRecords, setTotalRecords] = useState<number>(0)
    const [inputValue, setInputValue] = useState<string>("")

    // for maintaining if the overlay panel is hidden or not
    const overlay = useRef<OverlayPanel>(null)

    // only runs whenever the page or rows change
    useEffect(() => {
        async function call() {
            const data = await callApi(page, rows)
            // setting state for artworks data and total possible paginated values provided by api
            setArtworks(data.data)
            setTotalRecords(data.pagination.total)
        }
        call()
    }, [page, rows])

    // gets callled when the apply button is clicked
    // if value is <0 or just not an proper number  then the overlay gets auto hidden
    const handleSelectRows = async () => {
        const numRows = parseInt(inputValue.trim(), 10)

        if (!isNaN(numRows) && numRows > 0) {
            let fetched: Artwork[] = []
            let currentPage = 1
            const pageSize = rows

            while (fetched.length < numRows) {
                const data = await callApi(currentPage, pageSize)
                fetched = [...fetched, ...data.data]
                currentPage++

                if (fetched.length >= data.pagination.total) break
            }

            setSelectedArtworks(fetched.slice(0, numRows))
        }
        overlay.current?.hide()
    }

    return (
        <div>
            <div>
                <h3>Artworks Table</h3>
                <Button
                    label="Select Rows"
                    icon="pi pi-filter"
                    onClick={(e) => overlay.current?.toggle(e)}
                />
            </div>

            <OverlayPanel ref={overlay} dismissable>
                <div>
                    <label htmlFor="rowInput">
                        Enter number of rows to auto select
                    </label>
                    <InputText
                        id="rowInput"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="e.g. 20 rows "
                    />
                    <Button
                        label="Apply"
                        icon="pi pi-check"
                        onClick={handleSelectRows}
                    />
                </div>
            </OverlayPanel>

            {
                // @ts-ignore
                <DataTable
                    value={artworks}
                    paginator
                    lazy
                    totalRecords={totalRecords}
                    first={(page - 1) * rows}
                    rows={rows}
                    rowsPerPageOptions={[6, 12]}
                    onPage={(e) => {
                        if (!e.page) return <div>Something went wrong</div>
                        setPage(e.page + 1)
                        setRows(e.rows)
                    }}
                    dataKey="id"
                    selection={selectedArtworks}
                    // @ts-ignore
                    onSelectionChange={(e) => setSelectedArtworks(e.value)}
                    stripedRows
                    tableStyle={{ minWidth: "60rem" }}
                >
                    <Column
                        selectionMode="multiple"
                        headerStyle={{ width: "3rem" }}
                    />
                    <Column field="id" header="ID" />
                    <Column field="place_of_origin" header="Place of Origin" />
                    <Column field="artist_display" header="Artist" />
                    <Column field="inscriptions" header="Inscriptions" />
                    <Column field="date_start" header="Date Start" />
                    <Column field="date_end" header="Date End" />
                </DataTable>
            }
        </div>
    )
}
