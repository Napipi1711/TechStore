import React from 'react';
import brandApi from '../../api/brandApi';

const DeleteBrand = ({ id, onDeleteSuccess }) => {
  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) {
      try {
        await brandApi.delete(id);
        onDeleteSuccess(); 
      } catch (err) {
        alert("Xóa thất bại!");
      }
    }
  };

  return (
    <button onClick={handleDelete} style={{ color: 'red' }}>
      Xóa
    </button>
  );
};

export default DeleteBrand;