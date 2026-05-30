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
            ? "Edit Category"
            : "Add Category"
        }

      </h2>

      <div className="form-group">

        <label>
          Category Name
        </label>

        <input
          type="text"
          name="categoryName"
          value={formData.categoryName}
          onChange={handleChange}
          placeholder="Enter category name"
          required
        />

      </div>

      <button
        type="submit"
        className="submit-btn"
      >

        {
          isEditing
            ? "Update Category"
            : "Save Category"
        }

      </button>

    </form>

  );

};

export default CategoryForm;