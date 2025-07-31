import React from "react";
import {
  type ProFormProps,
  type PageContainerProps,
  ProFormColumnsType,
} from "@ant-design/pro-components";
import { type ModalProps } from "antd";

export type detailModeProps = {
  title: string;
  preSetDataHandler: (e: any) => void;
  preTimeLine: (e: any) => void;
  formSections: any[];
};

export type FormProps = ProFormProps & {
  _extra: {
    showSubmit: boolean;
    showDraft: boolean;
    showCancel: boolean;
    submitText?: string;
  };
};

export type viewModeProps = ModalProps | PageContainerProps | detailModeProps;

export type DefaultProps = {
  title?: string;
  handlerOK?: (e: any) => Promise<void>;
  handlerDraft?: (e: any) => Promise<void>;
  handlerCancel?: (e?: any) => void;
  modeProps?: viewModeProps;
  formProps?: FormProps;
  schema?: ProFormColumnsType<any>;
  data?: any;
  content?: (
    data?: any,
    options?: {
      handlerOK?: (e: any) => Promise<void>;
      handlerDraft?: (e: any) => Promise<void>;
      handlerCancel?: (e?: any) => void;
    }
  ) => JSX.Element | React.ReactNode;
  onHideFather?: (e: any) => void | any;
};

export type DefaultFormProps = Partial<
  Pick<
    DefaultProps,
    | "data"
    | "schema"
    | "handlerOK"
    | "handlerDraft"
    | "handlerCancel"
    | "formProps"
    | "modeProps"
    | "title"
    | "content"
  >
> & {};
