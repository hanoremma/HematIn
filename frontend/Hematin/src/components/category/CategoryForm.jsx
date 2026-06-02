const CategoryForm = ({
  formData,
  handleChange,
  handleSubmit,
  isEditing = false,
}) => {

  return (

    <form
      className="category-form"
      onSubmit={handleSubmit}
    >

      <h2 className="form-title">

        {
          isEditing
            ? "Edit Kategori"
            : "Tambah Kategori"
        }

      </h2>

      <div className="form-group">

        <label>
          Nama Kategori
        </label>

        <input
          type="text"
          name="categoryName"
          value={formData.categoryName}
          onChange={handleChange}
          placeholder="Masukkan nama kategori"
          required
        />

      </div>

      <button
        type="submit"
        className="submit-btn"
      >

        {
          isEditing
            ? "Update Kategori"
            : "Simpan Kategori"
        }

      </button>

    </form>

  );

};

export default CategoryForm;