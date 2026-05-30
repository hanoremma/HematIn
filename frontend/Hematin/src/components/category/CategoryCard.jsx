const CategoryCard = ({
  category,
  onEdit,
  onDelete,
}) => {

  return (

    <div className="category-card">

      <div className="category-card-content">

        <h3>
          {category.category_name}
        </h3>

        {
          category.is_default && (
            <span className="default-badge">
              Default
            </span>
          )
        }

      </div>

      {
  !category.is_default && (

    <div
      className="
      category-actions
      "
    >

      <button
        className="edit-btn"
        onClick={onEdit}
      >
        Edit
      </button>

      <button
        className="delete-btn"
        onClick={onDelete}
      >
        Delete
      </button>

    </div>

  )
}

    </div>

  );

};

export default CategoryCard;