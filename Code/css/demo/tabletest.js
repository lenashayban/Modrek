function onDelete(td) {
    if (confirm('Are you sure to delete this project?')) {
        row = td.parentElement.parentElement;
        document.getElementById("myTable").deleteRow(row.rowIndex);
        resetForm();
    }
}
function onDeleteTask(td) {
    if (confirm('Are you sure to delete this Task?')) {
        row = td.parentElement.parentElement;
        var cells = row.getElementsByTagName('td');
        var cost = cells[2].innerHTML;
        totalCost-=cost;
        //td.innerHTML = cost;
        document.getElementById("myTable").deleteRow(row.rowIndex);
        updateTotalCost();
        resetForm();
    }
}
