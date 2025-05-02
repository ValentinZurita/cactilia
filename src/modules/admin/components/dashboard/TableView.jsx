/**
 * TableView
 * A reusable table component for displaying data with Bootstrap styling.
 *
 * @param {Object[]} data - The array of items to render in the table.
 * @param {Object[]} columns - The configuration for table columns. Each column has { accessor, header, cell }.
 * @param {boolean} loading - Whether data is loading.
 * @param {string} [tableClass] - Additional class names for the table.
 * @param {string} [theadClass] - Additional class names for the thead.
 * @param {{borderRadius: string, overflow: string}} [style] - Inline shipping for the table wrapper.
 * @returns {JSX.Element}
 *
 * @example
 * <TableView
 *   data={products}
 *   columns={[
 *     { accessor: 'image', header: 'Imagen', cell: (row) => <img ... /> },
 *     { accessor: 'name', header: 'Nombre' },
 *   ]}
 *   loading={loading}
 *   tableClass='table-striped table-hover border shadow-sm'
 *   theadClass='table-dark'
 *   style={{ borderRadius: '12px', overflow: 'hidden' }}
 * />
 */


export const TableView = ({ data, columns, loading, tableClass = '', theadClass = '', style = {} }) => {

  if (loading) {
    return <p>Cargando...</p>
  }

  return (
    <div className="table-responsive">
      <table className={`table ${tableClass}`} style={style}>

        {/*Table Headers*/}
        <thead className={theadClass}>
        <tr>
          {columns.map((col) => (
            <th key={col.key || col.accessor} className="py-3 px-2">
              {col.header}
            </th>
          ))}
        </tr>
        </thead>

        {/*Table Body*/}
        <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            {columns.map((col) => (
              <td key={`${item.id}-${col.key || col.accessor}`} className="align-middle">
                {col.cell ? col.cell(item) : col.renderCell ? col.renderCell(item) : item[col.key || col.accessor]}
              </td>
            ))}
          </tr>
        ))}
        </tbody>

      </table>
    </div>
  )

}