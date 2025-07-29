import Page from "./components/index";
import {
  type PageContainerProps,
  type ProFormColumnsType,
  type ProTableProps,
} from "@ant-design/pro-components";
import {
  type DefaultProps,
  type viewModeProps,
  type FormProps,
} from "./detail";
import React from "react";

type custRender = {
  render: Pick<DefaultProps, "content">;
  base: "modal" | "page" | "none";
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
  formProps?: FormProps; //全局
  tableProps?: ProTableProps<any, any>;
  toolBar?: apiButton<T>[];
  actions?: apiButton<T>[];
  onHideFather?: (arg0: boolean) => void;
  onDetailSuccess?: () => void;
}

export * from "./detail";

export default Page;
export { PlusProvider } from "./components/plus";
