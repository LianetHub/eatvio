export const fixedTable = () => {

    const fixedTable = document.querySelector('.fixed-columns');

    if (!fixedTable) return;

    let parentTable = fixedTable.parentElement;

    let cloneTable = fixedTable.cloneNode(true);
    cloneTable.classList.add('clone');
    parentTable.appendChild(cloneTable);

    let tableRows = fixedTable.rows;


    for (let i = 0; i < tableRows.length; i++) {
        const tableRow = tableRows[i];
        const tableCells = tableRow.children;
        for (let i = 0; i < tableCells.length; i++) {
            const cell = tableCells[i];
            if (cell.querySelector('.checkbox')) {
                cell.innerHTML = "";
            }
        }
    }
}