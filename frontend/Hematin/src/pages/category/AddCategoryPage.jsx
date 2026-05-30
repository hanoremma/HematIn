import { useState } from "react";

import CategoryForm
from "../../components/category/CategoryForm";

import {
  addCategory
} from "../../services/categoryService";

const AddCategoryPage = () => {

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  const [formData,
  setFormData] =
    useState({

      categoryName: ""

    });

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

        await addCategory({

          id_user:
            user.id_user,

          category_name:
            formData.categoryName

        });

        alert(
          "Category berhasil ditambahkan"
        );

        setFormData({

          categoryName: ""

        });

      } catch (error) {

        console.log(error);

      }

  };

  return (

    <div className="page-container">

      <CategoryForm

        formData={formData}

        handleChange={
          handleChange
        }

        handleSubmit={
          handleSubmit
        }

      />

    </div>

  );

};

export default AddCategoryPage;