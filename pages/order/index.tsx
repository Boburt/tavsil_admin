import React, { useEffect, useMemo, useState } from 'react'
import { Input, Table, Select, DatePicker, Space } from 'antd'
import type { ColumnsType, TableProps } from 'antd/lib/table'
import MainLayout from '@components/ui/MainLayout'
import currency from 'currency.js'
import defaultChannel from '@services/defaultChannel'
import getConfig from 'next/config'
import axios from 'axios'
import authRequired from '@services/authRequired'
import { useDarkMode } from 'next-dark-mode'
import Cookies from 'js-cookie'

import { ordersFilterState } from '@atoms/orders_filter'
import { useRecoilState } from 'recoil'
import moment from 'moment'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

axios.defaults.withCredentials = true

const { Option } = Select
const { RangePicker } = DatePicker
const dateFormat = 'YYYY-MM-DD'

const handleChange = (value: string) => {
  console.log(`selected ${value}`)
}

export default function Orders() {
  const user = authRequired({})
  const {
    darkModeActive, // boolean - whether the dark mode is active or not
  } = useDarkMode()
  useEffect(() => {
    if (!user) {
      return
    }
  }, [])

  const [products, setProducts] = useState([])
  const [channelName, setChannelName] = useState('')
  const [productSearchText, setProductSearchText] = useState('')
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [notification, setNotification] = useState({ title: '', body: '' })
  const [orderFilter, setOrderFilter] = useRecoilState(ordersFilterState)

  const fetchData = async () => {
    const channelData = await defaultChannel()
    console.log(orderFilter)
    // const {
    //   data: { data: result },
    // } = await axios.get(`${webAddress}/api/categories?mode=tree`)
    setChannelName(channelData.name)
  }

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

  const onOrderDateFilterChange = (date: any, dateString: string[]) => {
    console.log(dateString)
    // setOrderFilter({ ...orderFilter, orderDate: dateString })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onSearch = async (value: any) => {
    setProductSearchText(value)
  }

  const productsColumns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      render: (_: any, record: any) => {
        console.log(channelName)
        return <div>{record?.attribute_data?.name[channelName]?.ru}</div>
      },
    },
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

  const fetchProducts = async () => {
    setIsMenuLoading(true)
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/products`)
    setProducts(result)
    setIsMenuLoading(false)
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

  return (
    <MainLayout title="Заказы">
      <div className="flex space-x-2 mb-3">
        <RangePicker
          defaultValue={[
            moment(orderFilter.dateFrom, dateFormat),
            moment(orderFilter.dateTo, dateFormat),
          ]}
          format={'DD.MM.YYYY'}
          onCalendarChange={onOrderDateFilterChange}
        />
        <Select
          defaultValue="lucy"
          style={{ width: 120 }}
          onChange={handleChange}
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="disabled" disabled>
            Disabled
          </Option>
          <Option value="Yiminghe">yiminghe</Option>
        </Select>
        <Select defaultValue="lucy" style={{ width: 120 }}>
          <Option value="lucy">Lucy</Option>
        </Select>
        <Input.Search
          placeholder="Search..."
          allowClear
          onSearch={onSearch}
          style={{ width: 400 }}
        />
      </div>
      <Table
        columns={productsColumns}
        dataSource={filteredProduct}
        loading={isMenuLoading}
        rowKey="id"
        size="small"
        bordered
      />
    </MainLayout>
  )
}
