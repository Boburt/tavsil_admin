import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Drawer, Button, Form, Input, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import defaultChannel from '@services/defaultChannel'
import axios from 'axios'
import getConfig from 'next/config'
import currency from 'currency.js'
import { Key } from 'antd/lib/table/interface'
import { DataNode, EventDataNode } from 'antd/lib/tree'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import Hashids from 'hashids'
import Cookies from 'js-cookie'

const CreateMenuDrawer: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [prodSelectedRowKeys, setProdSelectedRowKeys] = useState([] as any)
  const [productSearchText, setProductSearchText] = useState('')
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null as any)
  const [selectedProducts, setSelectedProducts] = useState([] as any[])
  const [selectedVariant, setSelectedVariant] = useState(null as any)
  const showDrawer = () => {
    setVisible(true)
  }
  const onClose = () => {
    setVisible(false)
  }
  const [form] = Form.useForm()
  const submitForm = () => {
    form.submit()
  }

  const { publicRuntimeConfig } = getConfig()
  let webAddress = publicRuntimeConfig.apiUrl

  axios.defaults.withCredentials = true

  async function asyncForEach(array: any[], callback: Function) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  const fetchProducts = async (selectedId: number = 0) => {
    setIsMenuLoading(true)
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/products?`)
    setProducts(result)
    setIsMenuLoading(false)
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

  const productsColumns = [
    {
      title: 'Название',
      dataIndex: 'name',
      render: (_: any, record: any) => {
        return <div>{record?.attribute_data?.name[channelName]?.ru}</div>
      },
    },
    {
      title: 'Количество',
      dataIndex: 'count',
      render: (_: any, record: any) => {
        return <div>{record?.attribute_data?.name[channelName]?.uz}</div>
      },
    },

    {
      title: 'Цена',
      dataIndex: 'price',
      render: (_: any, record: any) => {
        return (
          <div>
            {/* {{currency(record?.price, {
              pattern: '# !',
              separator: ' ',
              decimal: '.',
              symbol: `сум`,
              precision: 0,
            }).format()}} */}
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
    <>
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
              onClick={submitForm}
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
            expandable={{ expandedRowRender }}
            rowKey="id"
            size="small"
            bordered
            rowSelection={{
              type: 'checkbox',
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
          />
        </div>
      </Drawer>
    </>
  )
}

export default CreateMenuDrawer
