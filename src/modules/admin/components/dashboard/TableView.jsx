

/**
 * TableView
 * A reusable table component for displaying data with Bootstrap styling.
 *
 * @param {Object[]} data - The array of items to render in the table.
 * @param {Object[]} columns - The configuration for table columns. Each column has { key, header, renderCell }.
 * @param {boolean} loading - Whether data is loading.
 * @param {string} [tableClass] - Additional class names for the table.
 * @param {string} [theadClass] - Additional class names for the thead.
 * @param {{borderRadius: string, overflow: string}} [style] - Inline styles for the table wrapper.
 * @returns {JSX.Element}
 *
 * @example
 * <TableView
 *   data={products}
 *   columns={[
 *     { key: 'image', header: 'Imagen', renderCell: (prod) => <img ... /> },
 *     { key: 'name', header: 'Nombre', renderCell: (prod) => prod.name },
 *   ]}
 *   loading={loading}
 *   tableClass='table-striped table-hover border shadow-sm'
 *   theadClass='table-dark'
 *   style={{ borderRadius: '12px', overflow: 'hidden' }}
 * />
 */


export const TableView = ({ data, columns, loading, tableClass = '', theadClass = '', style = {} }) => {

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="table-responsive">
      <table className={`table ${tableClass}`} style={style}>

        {/*Table Headers*/}
        <thead className={theadClass}>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="py-3 px-2">
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

              <td key={col.key} className="align-middle">
                {col.renderCell(item)}
              </td>

            ))}
          </tr>

        ))}
        </tbody>

      </table>
    </div>
  );

};