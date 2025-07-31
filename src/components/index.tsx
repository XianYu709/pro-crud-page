import {
  type ProColumns,
  ProConfigProvider,
  ProTable,
  type ProTableProps,
} from "@ant-design/pro-components";
import { cloneDeep } from "lodash";
import { Button, Popconfirm } from "antd";
import { custRender, type apiButton, type PageProps } from "../index";
import Detail from "./detail";
import React, { useRef, useState, useEffect, useMemo, useContext } from "react";
import { PlusContext } from "../components/plus";
/* main */

export default function Page<T>(props: PageProps<T>) {
  const tableRef = useRef<any>();
  const provide = useContext(PlusContext);

  const flushData = async () => {
    tableRef.current.reloadAndRest();
    tableRef.current.reload();
    props?.onDetailSuccess?.();
  };

  useEffect(() => {
    if (props?.tableRef) {
      if (typeof props.tableRef === "function") {
        props.tableRef(tableRef.current);
      } else {
        props.tableRef.current = tableRef.current;
      }
    }
  }, []);

  const detailRef = useRef<any>();
  let rowColumns: any;

  const getDeepestText = (children: any): string => {
    if (typeof children === "string") return children;
    if (Array.isArray(children)) return children.join("-"); // 用 - 拼接数组元素
    if (React.isValidElement(children))
      // @ts-ignore
      return getDeepestText(children.props.children);
    return "";
  };

  const mergeDataAndColumns = (row: any, columns: ProColumns<T>[]) => {
    if (!row) return columns;
    const newObj = JSON.parse(JSON.stringify(columns));
    newObj.forEach((col: any, index: number) => {
      col.key = `${col.dataIndex}-${index}`;
      if (Object.keys(row).includes(col.dataIndex)) {
        if (col.valueType === "select") {
          col.initialValue = row[col.dataIndex];
        } else {
          col.initialValue = row[col.dataIndex];
        }
      }
    });
    newObj.push({
      title: "_other",
      dataIndex: "_other",
      formItemProps: {
        hidden: true,
      },
      search: false,
      hideInTable: true,
      hideInSearch: true,
      initialValue: row.other,
      key: "_other",
    });
    return newObj;
  };

  const renderApiButton = (apiButtonList: apiButton<T>[], rowData?: any) => {
    const showButton = (item: any) => {
      if (!!item.show) {
        return item?.show(rowData);
      } else {
        return true;
      }
    };

    const extraAndFlush = async (callBack: () => void) => {
      try {
        await callBack();
      } catch (error) {
        console.log(error);
        console.trace();
      } finally {
        flushData();
      }
    };

    const getButton = (item: apiButton<any>, onClick?: () => void) => {
      if (typeof item.body === "string" || typeof item.body === "number") {
        return (
          showButton(item) && (
            <Button
              key={`${getDeepestText(item.body)}`}
              onClick={onClick}
              style={{
                marginRight: "12px",
              }}
            >
              {item.body}
            </Button>
          )
        );
      } else {
        return (
          showButton(item) &&
          React.cloneElement(item.body as React.ReactElement<any>, {
            onClick: onClick,
            key: `${getDeepestText(item.body)}`,
          })
        );
      }
    };

    return apiButtonList.map((item: apiButton<any>, index: number) => {
      let element: React.ReactNode;
      let mode: any = item.mode;
      const extraModeKeys = Object.keys(provide?.ModeMap || {});
      if (extraModeKeys.includes(mode)) mode = "extraMode";
      if (typeof item.mode === "object") mode = "custMode";
      switch (mode) {
        case "clickBtn":
          // element = getButton(item, () => item.api(removeDefault(rowColumns)));
          element = getButton(item, () =>
            extraAndFlush(() => item.api(rowData))
          );
          break;
        case "clickPrimry":
          element = (
            <Popconfirm
              key={`${getDeepestText(item.body)}-${index}`}
              title={`确定执行${getDeepestText(item.body)}操作吗?`}
              onConfirm={() => extraAndFlush(() => item.api(rowData))}
              okText="是"
              cancelText="否"
            >
              {getButton(item)}
            </Popconfirm>
          );
          break;
        case "modalForm":
          element = getButton(item, async () => {
            if (item?.preHandler) {
              const flag = await item?.preHandler?.();
              if (!flag) return;
            }
            detailRef.current?.show({
              title: getDeepestText(item.body),
              data: mergeDataAndColumns(
                rowData,
                item?.fromSchema ?? rowColumns
              ),
              mode: "modal",
              modeProps: item.viewModeProps,
              formProps: item.formProps,
              handlerOK: item.api,
              handlerDraft: item?.api2,
            });
          });
          break;
        case "pageForm":
          element = getButton(item, async () => {
            if (item?.preHandler) {
              const flag = await item?.preHandler?.();
              if (!flag) return;
            }
            detailRef.current?.show({
              title: getDeepestText(item.body),
              data: mergeDataAndColumns(
                rowData,
                item?.fromSchema ?? rowColumns
              ),
              mode: "page",
              modeProps: item.viewModeProps,
              formProps: item.formProps,
              handlerOK: item.api,
              handlerDraft: item?.api2,
            });
          });
          break;
        case "extraMode":
          element = getButton(item, async () => {
            if (item?.preHandler) {
              const flag = await item?.preHandler?.();
              if (!flag) return;
            }
            detailRef.current?.show({
              title: getDeepestText(item.body),
              data: {
                rowData,
                rowColumns,
                dataWithCol: mergeDataAndColumns(rowData, rowColumns),
              },
              mode: item.mode,
              modeProps: item.viewModeProps,
            });
          });
          break;
        case "custMode":
          const modeObject = item.mode as custRender;
          element = getButton(item, () => {
            detailRef.current?.show({
              title: getDeepestText(item.body),
              data: {
                rowData,
                rowColumns,
                dataWithCol: mergeDataAndColumns(rowData, rowColumns),
              },
              modeProps: item.viewModeProps,
              mode: modeObject.base,
              custRender: modeObject.render,
            });
          });
          break;
      }
      return element;
    });
  };

  const getTableProps = (): ProTableProps<T, any> | undefined => {
    const itemSettings = {
      tableProps: props.tableProps as ProTableProps<T, any>,
      toolBar: props.toolBar,
      actions: props.actions,
    };
    if (!itemSettings) return;
    const rawTableProps = itemSettings.tableProps as ProTableProps<T, any>;

    const rowProps: ProTableProps<T, any> = {
      ...rawTableProps,
      columns: cloneDeep(rawTableProps?.columns || []),
    };

    rowColumns ??= rowProps.columns;

    const toolBar = renderApiButton(itemSettings?.toolBar ?? []);

    const shouldAddOptionsCol =
      Object.keys(itemSettings.actions || {}).length !== 0;

    if (
      shouldAddOptionsCol &&
      !rowProps.columns?.some((col) => col.valueType === "option")
    ) {
      const optionsCol: ProColumns = {
        valueType: "option",
        dataIndex: (itemSettings.tableProps.rowKey || "id") as any,
        render: (_, row) => [
          ...renderApiButton(itemSettings?.actions ?? [], row),
        ],
        ...(props?.tableProps?.optionsColSetting || {}),
        title: "操作",
      };
      rowProps.columns.push(optionsCol);
    }

    return {
      ...rowProps,
      headerTitle: toolBar,
    };
  };

  const tableProps = useMemo(
    () => getTableProps(),
    [props.tableProps, props.actions, props.toolBar]
  );

  const [showFather, setShowFather] = useState<any>(true);
  const handlerHideFather = (data: any) => {
    setShowFather(!data);
    props?.onHideFather?.(data);
  };

  return (
    <ProConfigProvider valueTypeMap={provide?.FormValueType}>
      <div
        key={props.title ?? "ProConfigProvider"}
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          border: "1px solid #f0f0f0",
          borderTop: "none",
          ...props?.pageProps?.style,
          display: showFather ? "block" : "none",
          ...provide?.outBoxProps?.style,
        }}
      >
        {props?.subTitle && <div>{props?.subTitle}</div>}
        <ProTable<any>
          {...(provide?.globalTableProps as any)}
          actionRef={tableRef}
          key={props.title ?? "ProTable"}
          dateFormatter="string"
          {...tableProps}
          // toolBarRender={() => []}
        />
      </div>
      <div
        style={{
          visibility: !showFather ? "visible" : "hidden",
        }}
      >
        <Detail
          ref={detailRef}
          key={props.title ?? "Detail"}
          onHideFather={handlerHideFather}
          onSuccess={flushData}
          formProps={{ ...provide?.globalFormProps, ...props?.formProps }}
        ></Detail>
      </div>
    </ProConfigProvider>
  );
}
