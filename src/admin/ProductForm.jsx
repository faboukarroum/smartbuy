import { useForm } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'

export default function ProductForm() {
  const { id } = useParams()           // if id exists → edit mode
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data) => {
    if (id) {
      await updateProduct(id, data)    // your API call
    } else {
      await createProduct(data)        // your API call
    }
    navigate('/admin/products')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} placeholder="Product name" />
      <input {...register('price')} type="number" placeholder="Price" />
      <textarea {...register('description')} placeholder="Description" />
      <input {...register('image')} placeholder="Image URL" />
      <input {...register('stock')} type="number" placeholder="Stock" />
      <select {...register('category')}>
        <option value="clothing">Clothing</option>
        <option value="accessories">Accessories</option>
      </select>
      <button type="submit">{id ? 'Update' : 'Create'} product</button>
    </form>
  )
}