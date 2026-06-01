import {
  useState,
  useEffect,
  useCallback
} from "react";

import CategoryCard
from "../../components/category/CategoryCard";

import Modal
from "../../components/ui/Modal";

import CategoryForm
from "../../components/category/CategoryForm";

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from "../../services/categoryService";

const CategoriesPage = () => {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [categories,
  setCategories] =
    useState([]);

  /* =========================
     FETCH CATEGORY
  ========================= */

  const fetchCategories =
    useCallback(async () => {

      try {

        if (!user?.id_user)
          return;

        const data =
          await getCategories(
            user.id_user
          );

        setCategories(data);

      } catch (error) {

        console.log(error);

      }

    }, [user?.id_user]);

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {

  const loadCategories =
    async () => {

      try {

        const data =
          await getCategories(
            user.id_user
          );

        setCategories(data);

      } catch (error) {

        console.log(error);

      }

    };

  loadCategories();

}, [user?.id_user]);

  /* =========================
     DELETE
  ========================= */

  const handleDelete =
  async (id_category) => {

    const confirmDelete =
      window.confirm(
        "Apakah Anda yakin ingin menghapus kategori ini?"
      );

    if (!confirmDelete)
      return;

    try {

      await deleteCategory(
        id_category
      );

      alert(
        "Kategori berhasil dihapus"
      );

      fetchCategories();

    } catch (error) {

      console.log(error);

      alert(
        "Gagal menghapus kategori"
      );

    }

};

  const [showModal,
setShowModal] =
  useState(false);

const [isEditing,
setIsEditing] =
  useState(false);

const [selectedCategory,
setSelectedCategory] =
  useState(null);

const [formData,
setFormData] =
  useState({

    categoryName: ""

  });

  const handleAdd =
  () => {

    setIsEditing(false);

    setFormData({

      categoryName: ""

    });

    setShowModal(true);

};

const handleEdit =
  (category) => {

    setSelectedCategory(
      category
    );

    setIsEditing(true);

    setFormData({

      categoryName:
        category.category_name

    });

    setShowModal(true);

};

const handleChange =
  (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]: value

    }));

};

const handleSubmit =
  async (e) => {

    e.preventDefault();

    try {

      if (isEditing) {

        await updateCategory(

          selectedCategory.id_category,

          {

            category_name:
              formData.categoryName

          }

        );

      } else {

        await addCategory({

          id_user:
            user.id_user,

          category_name:
            formData.categoryName

        });

      }

      setShowModal(false);

      fetchCategories();

    } catch (error) {

      console.log(error);

    }

};

  return (

    <div className="category-page">

      {/* HEADER */}

      <div className="category-header">

        <div className="category-title">

          <i className="bi bi-tags"></i>

          <div>

            <h2>
              Categories
            </h2>

            <p>
              Kelola kategori transaksi
            </p>

          </div>

        </div>

        <button
  className="add-category-btn"
  onClick={handleAdd}
>
  + Add Category
</button>

      </div>

      {/* GRID */}

      <div className="category-grid">

        {categories.map(
          (category) => (

          <CategoryCard

  key={
    category.id_category
  }

  category={
    category
  }

  onEdit={() =>
    handleEdit(
      category
    )
  }

  onDelete={() =>
    handleDelete(
      category.id_category
    )
  }

/>

        ))}

        <Modal

  show={showModal}

  onClose={() =>
    setShowModal(false)
  }

  title=''

>

  <CategoryForm

    formData={formData}

    handleChange={
      handleChange
    }

    handleSubmit={
      handleSubmit
    }

    isEditing={
      isEditing
    }

  />

</Modal>

      </div>

    </div>

  );

};

export default CategoriesPage;
