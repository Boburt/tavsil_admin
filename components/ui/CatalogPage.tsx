import Head from 'next/head'
import Image from 'next/image'
import currency from 'currency.js'
import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Table,
  Tooltip,
  Popconfirm,
  Tree,
  Upload,
  message,
  Select,
  InputNumber,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  MergeCellsOutlined,
  DownOutlined,
  InboxOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import getConfig from 'next/config'
import React, { useState, useRef, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useDarkMode } from 'next-dark-mode'
import MainLayout from '@components/ui/MainLayout'
import authRequired from '@services/authRequired'
import Cookies from 'js-cookie'
import defaultChannel from '@services/defaultChannel'
import { Key } from 'antd/lib/table/interface'
import { DataNode, EventDataNode } from 'antd/lib/tree'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import Hashids from 'hashids'
import {
  BeforeUploadFileType,
  RcFile,
  UploadRequestError,
  UploadRequestOption as RcCustomRequestOptions,
  UploadProgressEvent,
  UploadRequestHeader,
  UploadRequestMethod,
} from 'rc-upload/lib/interface'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

axios.defaults.withCredentials = true

const { Dragger } = Upload
const { Option } = Select

async function asyncForEach(array: any[], callback: Function) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const CatalogPage = function () {
  const user = authRequired({})
  const {
    darkModeActive, // boolean - whether the dark mode is active or not
  } = useDarkMode()
  useEffect(() => {
    if (!user) {
      return
    }
  }, [])

  const categoryDropProps = {
    name: 'file',
    multiple: true,
    maxCount: 1,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange(info: any) {
      const { status } = info.file
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
    customRequest: async (options: RcCustomRequestOptions) => {
      const {
        onSuccess,
        onError,
        file,
        onProgress,
      }: {
        onProgress?: (event: UploadProgressEvent) => void
        onError?: (
          event: UploadRequestError | ProgressEvent,
          body?: any
        ) => void
        onSuccess?: (body: any, xhr: XMLHttpRequest) => void
        data?: object
        filename?: string
        file: Exclude<BeforeUploadFileType, File | boolean> | RcFile
        withCredentials?: boolean
        action: string
        headers?: UploadRequestHeader
        method: UploadRequestMethod
      } = options
      // console.log(arguments)
      await setAxiosCredentials()
      var formData = new FormData()
      formData.append('file', file)
      formData.append('parent', 'categories')
      formData.append('primary', 'true')
      const hashids = new Hashids(
        'changeme',
        8,
        'abcdefghijklmnopqrstuvwxyz1234567890'
      )
      formData.append('parent_id', hashids.encode(editingCategory.id))

      const config = {
        headers: { 'content-type': 'multipart/form-data' },
        onUploadProgress: (event: any) => {
          const percent: number = Math.floor((event.loaded / event.total) * 100)
          const progress: UploadProgressEvent = { ...event, percent }
          onProgress && onProgress(progress)
        },
      }
      axios
        .post(`${webAddress}/api/v1/assets`, formData, config)
        .then(({ data: response }) => {
          onSuccess && onSuccess(response, response)
        })
        .catch(onError)
    },
  }

  const dropProps = {
    name: 'file',
    multiple: true,
    maxCount: 1,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange(info: any) {
      const { status } = info.file
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
    customRequest: async (options: RcCustomRequestOptions) => {
      const {
        onSuccess,
        onError,
        file,
        onProgress,
      }: {
        onProgress?: (event: UploadProgressEvent) => void
        onError?: (
          event: UploadRequestError | ProgressEvent,
          body?: any
        ) => void
        onSuccess?: (body: any, xhr: XMLHttpRequest) => void
        data?: object
        filename?: string
        file: Exclude<BeforeUploadFileType, File | boolean> | RcFile
        withCredentials?: boolean
        action: string
        headers?: UploadRequestHeader
        method: UploadRequestMethod
      } = options
      // console.log(arguments)
      await setAxiosCredentials()
      var formData = new FormData()
      formData.append('file', file)
      formData.append('parent', 'products')
      formData.append('primary', 'true')
      console.log(selectedProducts[0].id)
      const hashids = new Hashids(
        'product',
        8,
        'abcdefghijklmnopqrstuvwxyz1234567890'
      )
      formData.append('parent_id', hashids.encode(selectedProducts[0].id))

      const config = {
        headers: { 'content-type': 'multipart/form-data' },
        onUploadProgress: (event: any) => {
          const percent: number = Math.floor((event.loaded / event.total) * 100)
          const progress: UploadProgressEvent = { ...event, percent }
          onProgress && onProgress(progress)
        },
      }
      axios
        .post(`${webAddress}/api/v1/assets`, formData, config)
        .then(({ data: response }) => {
          onSuccess && onSuccess(response, response)
        })
        .catch(onError)

      if (variants && variants.length) {
        await Promise.all(
          variants.map(async (v: any) => {
            var formData = new FormData()
            formData.append('file', file)
            formData.append('parent', 'products')
            formData.append('primary', 'true')
            formData.append('parent_id', hashids.encode(v.id))
            await axios.post(`${webAddress}/api/v1/assets`, formData, config)
          })
        )
      }
    },
  }

  // Drawers
  const [isDrawerVisible, setDrawer] = useState(false)
  //const [isCatEditDrawerVisible, setCatEditDrawer] = useState(false)
  const [isVariantDrawerVisible, setVariantDrawer] = useState(false)
  const [isMergeDrawerVisible, setMergeDrawerVisible] = useState(false)
  const [isAddDrawerVisible, setAddDrawerVisible] = useState(false)
  const [isAddProductDrawer, setIsAddProductDrawer] = useState(false)

  // Editing
  const [editingCategory, setEditingCategory] = useState(null as any)
  //console.log(editingCategory)
  const [editingMenuRecord, setEditingMenuRecord] = useState(null as any)
  const [editingVariant, setEditingVariant] = useState(null as any)
  const [isMergingMode, setIsMergingMode] = useState(false)

  // Table loaders
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [isVariantsLoading, setIsVariantsLoading] = useState(false)

  // Form submit loaders
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  //const [isCatEditSubmittingForm, setIsCatEditSubmittingForm] = useState(false)
  const [isVariantSubmittingForm, setIsVariantSubmittingForm] = useState(false)
  const [isMergeSubmittingForm, setIsMergeSubmittingForm] = useState(false)
  const [isAddProductSubmittingForm, setisAddProductSubmittingForm] =
    useState(false)

  // Table datas
  const [data, setData] = useState([])
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])
  const [cities, setCities] = useState([])

  // Selections
  const [selectedCategory, setSelectedCategory] = useState(null as any)
  const [selectedProducts, setSelectedProducts] = useState([] as any[])
  const [selectedVariant, setSelectedVariant] = useState(null as any)
  const [prodSelectedRowKeys, setProdSelectedRowKeys] = useState([] as any)

  // Search and Channel
  const [channelName, setChannelName] = useState('')
  const [productSearchText, setProductSearchText] = useState('')

  const [isShowUploader, setShowUploader] = useState(false)
  const [isCategoryShowUploader, setCategoryShowUploader] = useState(false)

  // Description editors
  const [ruDescriptionEditorState, setRuDescriptionEditorState] = useState('')
  const [uzDescriptionEditorState, setUzDescriptionEditorState] = useState('')
  const [enDescriptionEditorState, setEnDescriptionEditorState] = useState('')

  const [modifierProductList, setModifierProductList] = useState([] as any[])

  // Forms
  const [form] = Form.useForm()
  const [mergeForm] = Form.useForm()
  const [variantForm] = Form.useForm()
  const [newProductForm] = Form.useForm()

  const editCategory = () => {
    let cities = []
    setEditingCategory(selectedCategory)
    let name = selectedCategory.attribute_data.name[channelName]
    setCategoryShowUploader(selectedCategory.asset ? false : true)
    if (selectedCategory.cities) {
      cities = selectedCategory.cities.split(',')
    }
    form.resetFields()
    form.setFieldsValue({
      name_ru: name.ru,
      name_uz: name.uz,
      name_en: name.en,
      active: !!selectedCategory.active,
      sort: selectedCategory.sort,
      order: selectedCategory.order,
      cities,
    })
    setDrawer(true)
  }

  const addCategory = () => {
    let cities = []

    form.resetFields()

    setDrawer(true)
  }

  const editProduct = () => {
    const prod = selectedProducts[0]
    let name = prod.attribute_data.name[channelName]
    let description_ru = ''
    let description_uz = ''
    let description_en = ''
    if (prod.attribute_data?.description) {
      let desc = prod.attribute_data?.description[channelName]
      description_ru = desc?.ru || ''
      description_uz = desc?.uz || ''
      description_en = desc?.en || ''
    }
    setShowUploader(prod.asset ? false : true)

    let values = {
      name_ru: name.ru,
      name_uz: name.uz,
      name_en: name.en,
      description_ru,
      description_uz,
      description_en,
      active: !!prod.active,
      additional_sales: [] as number[],
    }

    if (prod.additional_sales) {
      values.additional_sales = prod.additional_sales.split(',')
    }

    mergeForm.resetFields()
    mergeForm.setFieldsValue(values)
    setMergeDrawerVisible(true)
  }

  const addProduct = () => {
    setIsAddProductDrawer(true)
  }

  // const editVariant = () => {
  //   setEditingVariant(selectedVariant)
  //   let name = selectedVariant.attribute_data.name[channelName]
  //   let values = {
  //     name_ru: name.ru,
  //     name_uz: name.uz,
  //     name_en: name.en,
  //     custom_name: selectedVariant.custom_name,
  //     custom_name_uz: selectedVariant.custom_name_uz,
  //     active: true,
  //     modifier_prod_id: selectedVariant.modifier_prod_id,
  //     box_id: selectedVariant.box_id,
  //     additional_sales: [] as number[],
  //   }
  //   if (selectedVariant.additional_sales) {
  //     values.additional_sales = selectedVariant.additional_sales.split(',')
  //   }
  //   variantForm.resetFields()
  //   variantForm.setFieldsValue(values)
  //   setVariantDrawer(true)
  // }

  const closeDrawer = () => {
    setEditingCategory(null)
    setDrawer(false)
  }

  // const closeCatEditDrawer = () => {
  //   setEditingCategory(true)
  //   setCatEditDrawer(false)
  // }

  const closeMergeDrawer = () => {
    setEditingCategory(null)
    setMergeDrawerVisible(false)
  }

  const closeAddProductDrawer = () => {
    setEditingCategory(null)
    setIsAddProductDrawer(false)
  }

  const closeVariantDrawer = () => {
    setVariantDrawer(false)
  }

  const startMergeProducts = () => {
    setIsMergingMode(true)
    setMergeDrawerVisible(true)
  }

  const fetchData = async () => {
    const channelData = await defaultChannel()
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/categories?mode=tree`)
    setChannelName(channelData.name)
    setData(result)

    const {
      data: { data: prodList },
    } = await axios.get(`${webAddress}/api/products`)
    setModifierProductList(prodList)

    const {
      data: { data: cityResult },
    } = await axios.get(`${webAddress}/api/cities/public`)
    setCities(cityResult)
  }

  const fetchProducts = async (selectedId: number = 0) => {
    setIsMenuLoading(true)
    const {
      data: { data: result },
    } = await axios.get(
      `${webAddress}/api/products?categoryId=${selectedId}&product_id=0`
    )
    setProducts(result)
    setIsMenuLoading(false)
    console.log(result)
    console.log(selectedId)
  }

  // const fetchVariants = async (selectedId: number = 0) => {
  //   setIsVariantsLoading(true)
  //   const {
  //     data: { data: result },
  //   } = await axios.get(
  //     `${webAddress}/api/products/variants?product_id=${selectedId}`
  //   )
  //   setVariants(result)
  //   setIsVariantsLoading(false)
  // }

  const setAxiosCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        },
        withCredentials: true,
      })
      let { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  // const submitVariantForm = () => {
  //   variantForm.submit()
  // }

  const submitMergeForm = () => {
    mergeForm.submit()
  }

  const submitNewProductForm = () => {
    newProductForm.submit()
  }

  const submitForm = () => {
    form.submit()
  }

  const onCategoryFinish = async (values: any) => {
    setIsSubmittingForm(true)
    await setAxiosCredentials()
    if (editingCategory) {
      let cities = values.cities.join(',')
      await axios.put(`${webAddress}/api/categories/${editingCategory?.id}`, {
        ...values,
        active: values.active ? '1' : '0',
        half_mode: values.half_mode ? '1' : '0',
        cities,
      })
    } else {
      let cities = values.cities.join(',')
      await axios.post(`${webAddress}/api/categories/`, {
        ...values,
        attribute_data: {
          name: { ru: values.name_ru, uz: values.name_uz, en: values.name_en },
        },
        active: values.active ? '1' : '0',
        half_mode: values.half_mode ? '1' : '0',
        cities,
      })
    }
    setIsSubmittingForm(false)
    closeDrawer()
    fetchData()
  }

  // const onAddCategory = async (values: any) => {
  //   setIsSubmittingForm(true)
  //   await setAxiosCredentials()

  //   //let cities = values.cities.join(',')
  //   await axios.post(`${webAddress}/api/categories/`, {
  //     ...values,
  //     attribute_data: {
  //       name: { ru: values.name_ru, uz: values.name_uz, en: values.name_en },
  //     },
  //     active: values.active ? '1' : '0',
  //     half_mode: values.half_mode ? '1' : '0',
  //     cities,
  //   })

  //   setIsSubmittingForm(false)
  //   closeDrawer()
  //   fetchData()
  // }

  const onProductsFinish = async (values: any) => {
    setIsMergeSubmittingForm(true)
    await setAxiosCredentials()

    const otpToken = Cookies.get('opt_token')

    if (values.additional_sales) {
      values.additional_sales = values.additional_sales.join(',')
    }
    if (selectedProducts.length == 1) {
      await axios.put(`${webAddress}/api/products/${selectedProducts[0].id}`, {
        ...values,
        custom_name: values.name_ru,
        active: values.active ? '1' : '0',
      })
    } else {
      await axios.post(
        `${webAddress}/api/products/merge`,
        {
          ...values,
          productIds: selectedProducts.map((prod) => prod.id),
          categoryId: selectedCategory.id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
    }

    setIsMergeSubmittingForm(false)
    setIsMergingMode(false)
    closeMergeDrawer()
    setSelectedProducts([])
    setProdSelectedRowKeys([])
    fetchProducts(selectedCategory.id)
  }

  const onNewProductsFinish = async (values: any) => {
    //setIsNewProductSubmittingForm(true)
    await setAxiosCredentials()

    const otpToken = Cookies.get('opt_token')

    if (selectedCategory) {
      await axios.post(
        `${webAddress}/api/products`,
        {
          ...values,
          categoryId: selectedCategory.id,
          attribute_data: {
            name: {
              ru: values.name_ru,
              uz: values.name_uz,
              en: values.name_en,
            },
          },
          active: values.active ? '1' : '0',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
    }

    //setIsNewProductSubmittingForm(false)
    closeAddProductDrawer()
    fetchProducts()
  }

  // const onVariantFinish = async (values: any) => {
  //   setIsVariantSubmittingForm(true)
  //   await setAxiosCredentials()

  //   if (values.additional_sales) {
  //     values.additional_sales = values.additional_sales.join(',')
  //   }

  //   await axios.put(`${webAddress}/api/products/${selectedVariant.id}`, {
  //     ...values,
  //     active: true,
  //   })

  //   setIsVariantSubmittingForm(false)
  //   closeVariantDrawer()
  //   let editableCount = selectedProducts.filter(
  //     (prod) => !prod.product_id && prod.price <= 0
  //   )
  //   if (editableCount.length === 1) {
  //     fetchVariants(editableCount[0].id)
  //   }
  // }

  const deleteAsset = async (assetId: number) => {
    await setAxiosCredentials()

    await axios.post(`${webAddress}/api/products/unlink_asset`, {
      assetId,
    })

    setSelectedProducts([
      {
        ...selectedProducts[0],
        asset: null,
      },
    ])
  }

  const deleteCategoryAsset = async (assetId: number) => {
    await setAxiosCredentials()

    await axios.post(`${webAddress}/api/assets/unlink_asset`, {
      assetId,
    })

    setEditingCategory({
      ...editingCategory,
      asset: null,
    })
  }

  const onSearch = async (value: any) => {
    setProductSearchText(value)
  }

  const onSelect = async (
    selectedKeys: Key[],
    info: {
      node: any
      selectedNodes: DataNode[]
    }
  ) => {
    setSelectedProducts([])
    setSelectedCategory(info.selectedNodes[0])
    setProdSelectedRowKeys([])
    fetchProducts(info?.node?.id)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const selectedProductsCount = useMemo(() => {
    let count = 0
    count = selectedProducts.filter((prod) => prod.price > 0).length
    return count
  }, [selectedProducts])

  const activeProductEdit = useMemo(() => {
    let active = false
    const prodLength = selectedProducts.filter(
      (prod) => !prod.product_id
    ).length
    active = prodLength == 1 && prodLength == selectedProducts.length
    return active
  }, [selectedProducts])

  const filteredProduct = useMemo(() => {
    let result = products

    if (productSearchText.length > 0) {
      result = result.filter((prod: any) => {
        return (
          prod?.attribute_data?.name[channelName]?.ru
            .toLowerCase()
            .indexOf(productSearchText.toLowerCase()) >= 0 ||
          prod?.attribute_data?.name[channelName]?.uz
            .toLowerCase()
            .indexOf(productSearchText.toLowerCase()) >= 0
        )
      })
    }

    return result
  }, [products, productSearchText])

  const productsColumns = [
    {
      title: 'Название(RU)',
      dataIndex: 'name_ru',
      render: (_: any, record: any) => {
        return <div>{record?.attribute_data?.name[channelName]?.ru}</div>
      },
    },
    {
      title: 'Название(UZ)',
      dataIndex: 'name_uz',
      render: (_: any, record: any) => {
        return <div>{record?.attribute_data?.name[channelName]?.uz}</div>
      },
    },
    {
      title: 'Название(EN)',
      dataIndex: 'name_en',
      render: (_: any, record: any) => {
        return <div>{record?.attribute_data?.name[channelName]?.en}</div>
      },
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      render: (_: any, record: any) => {
        return (
          <div>
            {currency(record?.price, {
              pattern: '# !',
              separator: ' ',
              decimal: '.',
              symbol: `сум`,
              precision: 0,
            }).format()}
          </div>
        )
      },
    },
  ]

  const expandedRowRender = (record: any) => {
    const columns = [
      { title: 'Название', dataIndex: 'name', key: 'name' },
      {
        title: 'Цена',
        key: 'price',
        render: (_: any, rec: any) => (
          <span>
            {currency(rec?.price, {
              pattern: '# !',
              separator: ' ',
              decimal: '.',
              symbol: `сум`,
              precision: 0,
            }).format()}
          </span>
        ),
      },
    ]
    return (
      <Table
        columns={columns}
        dataSource={record?.modifiers}
        pagination={false}
        rowKey="id"
        size="small"
        title={() => <div className="font-bold text-xl">Модификаторы</div>}
        bordered={true}
      />
    )
  }
  return (
    <MainLayout title="Каталог">
      <Drawer
        title={
          editingCategory
            ? 'Редактировать категорию'
            : 'Добавить новую категорию'
        }
        width={720}
        onClose={closeDrawer}
        visible={isDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
              Отмена
            </Button>
            <Button
              onClick={submitForm}
              loading={isSubmittingForm}
              type="primary"
            >
              Сохранить
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={form}
          size="small"
          onFinish={onCategoryFinish}
          initialValues={editingCategory ? editingCategory : undefined}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name_ru"
                label="Название"
                rules={[{ required: true, message: 'Просьба ввести название' }]}
              >
                <Input placeholder="Просьба ввести название" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_uz"
                label="Название(узб)"
                rules={[{ required: true, message: 'Просьба ввести название' }]}
              >
                <Input placeholder="Просьба ввести название" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_en"
                label="Название(анг)"
                rules={[{ required: true, message: 'Просьба ввести название' }]}
              >
                <Input placeholder="Просьба ввести название" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item name="icon" label="Иконка">
                <Input placeholder="Просьба ввести иконку" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="active" valuePropName="checked">
                <Checkbox>Активность</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* <Form.Item name="half_mode" valuePropName="checked">
                <Checkbox>Режим &quot;50/50&quot;</Checkbox>
              </Form.Item> */}
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="order" label="Сортировка">
                <InputNumber />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cities" label="Город">
                <Select
                  mode="multiple"
                  placeholder="Выберите город"
                  style={{ width: '100%' }}
                >
                  {cities.map((city: any) => (
                    <Select.Option key={city.id} value={city.id}>
                      {city.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              {isCategoryShowUploader ? (
                <Dragger {...categoryDropProps}>
                  <div>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Нажмите или перетащите файл в эту область, чтобы загрузить
                    </p>
                  </div>
                </Dragger>
              ) : (
                <div>
                  {editingCategory && editingCategory.asset && (
                    <div className="relative w-28">
                      <Image
                        src={editingCategory.asset.link}
                        width="100"
                        height="100"
                      />
                      <div className="absolute top-0 right-0">
                        <Button
                          size="small"
                          icon={<CloseOutlined />}
                          danger
                          shape="circle"
                          type="primary"
                          onClick={() =>
                            setEditingCategory(editingCategory.asset.id)
                          }
                        ></Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="desc"
                label="Описание(RU)"
                rules={[{ message: 'Просьба ввести текст' }]}
              >
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="desc_uz"
                label="Описание(UZ)"
                rules={[{ message: 'Просьба ввести текст' }]}
              >
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
      {/* edit product */}
      <Drawer
        title={isMergingMode ? 'Объединить товары' : 'Редактировать продукт'}
        width={720}
        onClose={closeMergeDrawer}
        visible={isMergeDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={closeMergeDrawer} style={{ marginRight: 8 }}>
              Отмена
            </Button>
            <Button
              onClick={submitMergeForm}
              loading={isMergeSubmittingForm}
              type="primary"
            >
              {isMergingMode ? 'Объединить' : 'Сохранить'}
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={mergeForm}
          size="small"
          onFinish={onProductsFinish}
          initialValues={selectedProducts[0] ? selectedProducts[0] : undefined}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name_ru"
                label="Заголовок(RU)"
                rules={[
                  { required: true, message: 'Просьба ввести заголовок' },
                ]}
              >
                <Input placeholder="Просьба ввести заголовок" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_uz"
                label="Заголовок(UZ)"
                rules={[
                  { required: true, message: 'Просьба ввести заголовок' },
                ]}
              >
                <Input placeholder="Просьба ввести заголовок" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_en"
                label="Заголовок(EN)"
                rules={[
                  { required: true, message: 'Просьба ввести заголовок' },
                ]}
              >
                <Input placeholder="Просьба ввести заголовок" />
              </Form.Item>
            </Col>
          </Row>
          {!isMergingMode && selectedProducts[0] && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="active" valuePropName="checked">
                  <Checkbox>Активность</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          )}
          {!isMergingMode && selectedProducts[0] && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="sort" label="Сортировка">
                  <InputNumber />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="weight" label="Вес">
                  <InputNumber />
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="box_id" label="Выберите коробку">
                <Select
                  showSearch
                  placeholder="Выберите товар"
                  optionFilterProp="children"
                >
                  {modifierProductList.map((prod: any) => (
                    <Option value={prod.id} key={prod.id}>
                      {prod.attribute_data['name'][channelName]['ru']}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {!isMergingMode && selectedProducts[0] && (
            <Row>
              <Col span={24}>
                {isShowUploader ? (
                  <Dragger {...dropProps}>
                    <div>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">
                        Нажмите или перетащите файл в эту область, чтобы
                        загрузить
                      </p>
                    </div>
                  </Dragger>
                ) : (
                  <div>
                    {selectedProducts[0].asset && (
                      <div className="relative w-28">
                        <Image
                          src={selectedProducts[0].asset.link}
                          width="100"
                          height="100"
                        />
                        <div className="absolute top-0 right-0">
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            danger
                            shape="circle"
                            type="primary"
                            onClick={() =>
                              deleteAsset(selectedProducts[0].asset.id)
                            }
                          ></Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          )}
          {!isMergingMode && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="additional_sales"
                    label="Товар для доп. продажи"
                  >
                    <Select
                      showSearch
                      placeholder="Выберите товар"
                      optionFilterProp="children"
                      mode="multiple"
                    >
                      {modifierProductList.map((prod: any) => (
                        <Option value={prod.id} key={prod.id}>
                          {prod.attribute_data['name'][channelName]['ru']}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="description_ru" label="Описание(RU)">
                    <ReactQuill
                      theme="snow"
                      value={ruDescriptionEditorState || ''}
                      onChange={(content: string) => {
                        setRuDescriptionEditorState(content)
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="description_uz" label="Описание(UZ)">
                    <ReactQuill
                      theme="snow"
                      value={uzDescriptionEditorState || ''}
                      onChange={(content: string) => {
                        setUzDescriptionEditorState(content)
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="description_en" label="Описание(EN)">
                    <ReactQuill
                      theme="snow"
                      value={enDescriptionEditorState || ''}
                      onChange={(content: string) => {
                        setEnDescriptionEditorState(content)
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Form>
      </Drawer>
      {/* add new product */}
      <Drawer
        title={'Добавить новый продукт'}
        width={720}
        onClose={closeAddProductDrawer}
        visible={isAddProductDrawer}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={closeAddProductDrawer} style={{ marginRight: 8 }}>
              Отмена
            </Button>
            <Button
              onClick={submitNewProductForm}
              loading={isAddProductSubmittingForm}
              type="primary"
            >
              Сохранить
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={newProductForm}
          size="small"
          onFinish={onNewProductsFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name_ru"
                label="Заголовок(RU)"
                rules={[
                  { required: true, message: 'Просьба ввести заголовок' },
                ]}
              >
                <Input placeholder="Просьба ввести заголовок" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_uz"
                label="Заголовок(UZ)"
                rules={[
                  { required: true, message: 'Просьба ввести заголовок' },
                ]}
              >
                <Input placeholder="Просьба ввести заголовок" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_en"
                label="Заголовок(EN)"
                rules={[
                  { required: true, message: 'Просьба ввести заголовок' },
                ]}
              >
                <Input placeholder="Просьба ввести заголовок" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sort" label="Сортировка">
                <InputNumber />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weight" label="Вес">
                <InputNumber />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Цена"
                rules={[{ required: true, message: 'Просьба ввести цену' }]}
              >
                <InputNumber />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="active" valuePropName="checked">
                <Checkbox>Активность</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="box_id" label="Выберите коробку">
                <Select
                  showSearch
                  placeholder="Выберите товар"
                  optionFilterProp="children"
                >
                  {modifierProductList.map((prod: any) => (
                    <Option value={prod.id} key={prod.id}>
                      {prod.attribute_data['name'][channelName]['ru']}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Dragger {...dropProps}>
                <div>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Нажмите или перетащите файл в эту область, чтобы загрузить
                  </p>
                </div>
              </Dragger>
            </Col>
          </Row>

          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="additional_sales"
                  label="Товар для доп. продажи"
                >
                  <Select
                    showSearch
                    placeholder="Выберите товар"
                    optionFilterProp="children"
                    mode="multiple"
                  >
                    {modifierProductList.map((prod: any) => (
                      <Option value={prod.id} key={prod.id}>
                        {prod.attribute_data['name'][channelName]['ru']}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {/* <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="description_ru" label="Описание(RU)">
                  <ReactQuill
                    theme="snow"
                    value={ruDescriptionEditorState || ''}
                    onChange={(content: string) => {
                      setRuDescriptionEditorState(content)
                    }}
                  />
                </Form.Item>
              </Col>
            </Row> */}
            {/* <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="description_uz" label="Описание(UZ)">
                  <ReactQuill
                    theme="snow"
                    value={uzDescriptionEditorState || ''}
                    onChange={(content: string) => {
                      setUzDescriptionEditorState(content)
                    }}
                  />
                </Form.Item>
              </Col>
            </Row> */}
            {/* <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="description_en" label="Описание(EN)">
                  <ReactQuill
                    theme="snow"
                    value={enDescriptionEditorState || ''}
                    onChange={(content: string) => {
                      setEnDescriptionEditorState(content)
                    }}
                  />
                </Form.Item>
              </Col>
            </Row> */}
          </>
        </Form>
      </Drawer>
      <Row gutter={16}>
        <Col span={6}>
          <div className="font-bold text-xl mb-3">Категории</div>
          <div className="flex justify-between mb-3">
            <Button type="primary" onClick={addCategory}>
              <PlusOutlined /> Добавить
            </Button>
            <Button
              type="primary"
              onClick={editCategory}
              disabled={!selectedCategory}
            >
              <EditOutlined /> Редактировать
            </Button>
          </div>
          <Tree
            showLine
            switcherIcon={<DownOutlined />}
            onSelect={onSelect}
            selectable={true}
            treeData={data}
            key="id"
            titleRender={(item: any) => (
              <div>{item?.attribute_data?.name[channelName]?.ru}</div>
            )}
          />
        </Col>
        <Col span={14}>
          <div className="font-bold text-xl mb-3">Продукты</div>
          <div className="flex space-x-2 mb-3">
            <Button
              type="primary"
              disabled={!selectedCategory}
              onClick={addProduct}
            >
              <PlusOutlined /> Добавить продукт
            </Button>
            <Button
              type="primary"
              onClick={editProduct}
              disabled={!activeProductEdit}
            >
              <EditOutlined /> Редактировать
            </Button>
            <Input.Search
              placeholder="Search..."
              allowClear
              onSearch={onSearch}
            />
          </div>
          <Table
            columns={productsColumns}
            dataSource={filteredProduct}
            loading={isMenuLoading}
            //expandable={{ expandedRowRender }}

            rowSelection={{
              type: 'radio',
              selectedRowKeys: prodSelectedRowKeys,
              onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
                setSelectedProducts(selectedRows)
                setProdSelectedRowKeys(selectedRowKeys)
                setSelectedVariant(null)
                // let editableCount = selectedRows.filter(
                //   (prod) => !prod.product_id && prod.price <= 0
                // )
                // if (editableCount.length === 1) {
                //   fetchVariants(editableCount[0].id)
                // } else {
                //   setVariants([])
                // }
              },
            }}
            rowKey="id"
            size="small"
            bordered
          />
        </Col>
        {/* <Col span={8}>
          <div className="font-bold text-xl mb-3">Варианты</div>
          <div className="flex space-x-2 mb-3">
            <Button
              type="primary"
              onClick={editVariant}
              disabled={!selectedVariant}
            >
              <EditOutlined /> Редактировать
            </Button>
          </div>
          <Table
            columns={productsColumns}
            dataSource={variants}
            loading={isVariantsLoading}
            expandable={{ expandedRowRender }}
            rowKey="id"
            size="small"
            bordered
            rowSelection={{
              type: 'radio',
              onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
                setSelectedVariant(selectedRows[0])
              },
            }}
          />
        </Col> */}
      </Row>
    </MainLayout>
  )
}

export default CatalogPage
