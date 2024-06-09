import cl from './table.module.css'
import React, { useState, useEffect } from 'react';

function CustomerTable1({ FetchUrl }) {
  const [customers, setCustomers] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());

  useEffect(() => {
    fetch(FetchUrl)
      .then(response => response.json())
      .then(data => setCustomers(data.table))
      .catch(error => console.error('Error fetching customers:', error));
  }, [FetchUrl]);

  const handleRowClick = (rowIndex) => {
    setSelectedRows(prevSelectedRows => {
      const newSelectedRows = new Set(prevSelectedRows);
      if (newSelectedRows.has(rowIndex)) {
        newSelectedRows.delete(rowIndex);
      } else {
        newSelectedRows.add(rowIndex);
      }
      return newSelectedRows;
    });
  };

  const handleDeleteRow = (rowIndex) => {
    const customerToDelete = customers[rowIndex];
    // Extract required data
    const { name, mail, phone } = customerToDelete;
    fetch('http://localhost:8000/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, mail, phone }), // Send extracted data
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        // Optionally, update the state or UI as needed after deletion
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleEditRow = (rowIndex) => {
    const customerToEdit = customers[rowIndex];
    // Extract required data
    const { name, mail, phone } = customerToEdit;
    fetch('http://localhost:8000/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, mail, phone }), // Send extracted data
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        // Optionally, update the state or UI as needed after edit
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <table className={cl.container}>
        <thead>
          <tr>
            {customers.length > 0 && Object.keys(customers[0]).map(key => (
              <th key={key}>{key}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, rowIndex) => (
            <tr
              key={rowIndex}
              className={selectedRows.has(rowIndex) ? cl.selectedRow : ''}
              onClick={() => handleRowClick(rowIndex)}
            >
              {Object.values(customer).map((value, colIndex) => (
                <td key={colIndex}>{value}</td>
              ))}
              <td>
                <button onClick={() => handleDeleteRow(rowIndex)}>Delete</button>
                <button onClick={() => handleEditRow(rowIndex)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerTable1;
