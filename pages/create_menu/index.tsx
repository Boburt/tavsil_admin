import Head from 'next/head'
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
  Calendar,
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
import currency from 'currency.js'
import defaultChannel from '@services/defaultChannel'
import Image from 'next/image'
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
import type { CalendarMode } from 'antd/lib/calendar/generateCalendar'
import type { Moment } from 'moment'
import moment from 'moment'

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

export default function Menus() {
  const user = authRequired({})
  const {
    darkModeActive, // boolean - whether the dark mode is active or not
  } = useDarkMode()
  useEffect(() => {
    if (!user) {
      return
    }
  }, [])

  const onPanelChange = (value: Moment, mode: CalendarMode) => {
    console.log(value.format('YYYY-MM-DD'), mode)
  }

  const [channelName, setChannelName] = useState('')
  const [visible, setVisible] = useState(false)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [prodSelectedRowKeys, setProdSelectedRowKeys] = useState([] as any)
  const [productSearchText, setProductSearchText] = useState('')
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null as any)
  const [selectedProducts, setSelectedProducts] = useState([] as any[])
  const [dateSelected, setDateSelected] = useState(
    moment().format('YYYY-MM-DD')
  )
  const [productsByDate, setProductsByDate] = useState([])

  const showDrawer = () => {
    fetchProducts()
    setVisible(true)
  }
  const onClose = () => {
    setVisible(false)
  }
  const [form] = Form.useForm()
  const submitForm = () => {
    form.submit()
  }

  async function asyncForEach(array: any[], callback: Function) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  const fetchProducts = async () => {
    setIsMenuLoading(true)
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/products`)
    setProducts(result)
    setIsMenuLoading(false)
  }

  // const fetchProductsByDate = async () => {
  //   setIsMenuLoading(true)
  //   const {
  //     data: { data: result },
  //   } = await axios.get(`${webAddress}/api/products?`)
  //   setProducts(result)
  //   setIsMenuLoading(false)
  // }

  const fetchData = async () => {
    const channelData = await defaultChannel()
    // const {
    //   data: { data: result },
    // } = await axios.get(`${webAddress}/api/categories?mode=tree`)
    setChannelName(channelData.name)
  }

  // const onSelect = async (
  //   selectedRowKeys: Key[],
  //   info: {
  //     node: any
  //     selectedNodes: DataNode[]
  //   }
  // ) => {
  //   setSelectedProducts([] as any[])
  //   setSelectedCategory(info.selectedNodes[0])
  //   setProdSelectedRowKeys([] as any[])
  //   fetchProducts(info?.node?.id)
  //   console.log(selectedProducts)
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

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    onDateSelect(moment(dateSelected))
  }, [])

  const productsColumns = [
    {
      title: 'Название(RU)',
      dataIndex: 'name_ru',
      render: (_: any, record: any) => {
        console.log(channelName)
        return <div>{record?.attribute_data?.name[channelName]?.ru}</div>
      },
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      render: (_: any, record: any) => {
        return <div></div>
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

  const onSearch = async (value: any) => {
    setProductSearchText(value)
  }

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

  const filteredProductsByDate = useMemo(() => {
    let result = productsByDate

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
  }, [productsByDate, productSearchText])

  const onDateSelect = async (date: Moment) => {
    let formatedDate = date.format('YYYY-MM-DD')
    setDateSelected(formatedDate)
    const {
      data: { result },
    } = await axios.get(
      `${webAddress}/api/products/get_products_by_date?date=${formatedDate}`
    )

    console.log(result)
    setProductsByDate(result)
  }

  // const filteredProductByDate = useMemo(() => {
  //   let result = selectedProducts

  //   if (productSearchText.length > 0) {
  //     result = result.filter((prod: any) => {
  //       return (
  //         prod?.attribute_data?.name[channelName]?.ru
  //           .toLowerCase()
  //           .indexOf(productSearchText.toLowerCase()) >= 0 ||
  //         prod?.attribute_data?.name[channelName]?.uz
  //           .toLowerCase()
  //           .indexOf(productSearchText.toLowerCase()) >= 0
  //       )
  //     })
  //   }

  //   return result
  // }, [selectedProducts, productSearchText])

  //send products menu to server

  const onNewMenuFinish = async (values: any) => {
    //setIsNewProductSubmittingForm(true)
    await setAxiosCredentials()

    const otpToken = Cookies.get('opt_token')

    if (prodSelectedRowKeys.length > 0 && dateSelected.length > 0) {
      await axios.post(
        `${webAddress}/api/day_to_menu_items`,
        {
          product_id: prodSelectedRowKeys,
          date: dateSelected,
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
    setVisible(false)
    setProdSelectedRowKeys([])
    onDateSelect(moment(dateSelected))
  }

  // const expandedRowRender = (record: any) => {
  //   const columns = [
  //     { title: 'Название', dataIndex: 'name', key: 'name' },
  //     {
  //       title: 'Цена',
  //       key: 'price',
  //       render: (_: any, rec: any) => (
  //         <span>
  //           {currency(rec?.price, {
  //             pattern: '# !',
  //             separator: ' ',
  //             decimal: '.',
  //             symbol: `сум`,
  //             precision: 0,
  //           }).format()}
  //         </span>
  //       ),
  //     },
  //   ]
  //   return (
  //     <Table
  //       columns={columns}
  //       dataSource={record?.modifiers}
  //       pagination={false}
  //       rowKey="id"
  //       size="small"
  //       title={() => <div className="font-bold text-xl">Модификаторы</div>}
  //       bordered={true}
  //     />
  //   )
  // }

  return (
    <MainLayout title="Меню">
      <div className="flex justify-end mb-2">
        <Button type="primary" onClick={showDrawer}>
          <PlusOutlined /> Добавить
        </Button>
        <Drawer
          title="Меню"
          placement="right"
          onClose={onClose}
          visible={visible}
          width={720}
          footer={
            <div
              style={{
                textAlign: 'right',
              }}
            >
              <Button onClick={onClose} style={{ marginRight: 8 }}>
                Отмена
              </Button>
              <Button
                onClick={onNewMenuFinish}
                loading={isSubmittingForm}
                type="primary"
              >
                Сохранить
              </Button>
            </div>
          }
        >
          <div>
            <div className="font-bold text-xl mb-3">Продукты</div>
            <div className="flex space-x-2 mb-3">
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
              rowKey="id"
              size="small"
              bordered
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: prodSelectedRowKeys,
                onChange: (
                  selectedRowKeys: React.Key[],
                  selectedRows: any[]
                ) => {
                  setSelectedProducts(selectedRows)
                  setProdSelectedRowKeys(selectedRowKeys)
                },
              }}
            />
          </div>
        </Drawer>
      </div>
      <div className="flex  gap-4">
        <div className="w-[400px]">
          <Calendar
            fullscreen={false}
            onPanelChange={onPanelChange}
            onSelect={onDateSelect}
          />
        </div>
        <div className="flex-grow">
          <div className="font-bold text-xl mb-3">Продукты</div>
          <div className="flex space-x-2 mb-3">
            <Input.Search
              placeholder="Search..."
              allowClear
              onSearch={onSearch}
            />
          </div>
          {/* Products list */}
          <Table
            columns={productsColumns}
            dataSource={filteredProductsByDate}
            loading={isMenuLoading}
            rowKey="id"
            size="small"
            bordered
            // rowSelection={{
            //   type: 'checkbox',
            //   selectedRowKeys: prodSelectedRowKeys,
            //   onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
            //     setSelectedProducts(selectedRows)
            //     setProdSelectedRowKeys(selectedRowKeys)
            //   },
            // }}
          />
        </div>
      </div>
    </MainLayout>
  )
}
function value(value: any, Moment: any): [any, any] {
  throw new Error('Function not implemented.')
}
