import Page from "./components/index";
import {
  ProColumnType,
  type PageContainerProps,
  type ProFormColumnsType,
  type ProTableProps,
} from "@ant-design/pro-components";
import { type DefaultProps, type viewModeProps } from "./detail";
import { type FormProps } from "./detail";
import React from "react";

export type custRender = {
  render: Pick<DefaultProps, "content">;
  base: "modal" | "page";
};

export type apiButton<T> = {
  api?: (e: any) => void;
  preHandler?: () => Promise<Boolean>;
  api2?: (e: any) => void;
  show?: (e: any) => void;
  body: string | React.ReactElement<any>;
  mode?:
    | "modalForm"
    | "pageForm"
    | "clickBtn"
    | "clickPrimry"
    | "detailMode"
    | string
    | custRender;
  setRowData?: (row: any) => {};
  fromSchema?: ProFormColumnsType<T>[];
  viewModeProps?: viewModeProps;
  formProps?: ProFormColumnsType<T>[];
};

export type tabItem<T> = {
  tableProps: ProTableProps<any, any>;
  toolBar: apiButton<T>[];
  actions: apiButton<T>[];
};

export type PageItemProps<T> = Record<string, tabItem<T>> | tabItem<T>;

export interface PageProps<T> {
  title?: string;
  subTitle?: string;
  pageProps?: PageContainerProps & {
    style?: React.CSSProperties;
  };
  tableRef?: React.MutableRefObject<any> | Function;
  formProps?: FormProps;
  tableProps?: ProTableProps<any, any> & {
    optionsColSetting?: ProColumnType<any>;
  };
  toolBar?: apiButton<T>[];
  actions?: apiButton<T>[];
  onHideFather?: (arg0: boolean) => void;
  onDetailSuccess?: () => void;
}

export * from "./detail";

export default Page;
export { PlusProvider, type PlusContextProps } from "./components/plus";
