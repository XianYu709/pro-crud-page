import React, { createContext } from "react";
import {
  type ProRenderFieldPropsType,
  type ProTableProps,
} from "@ant-design/pro-components";
import { FormProps } from "../detail";

export type PlusContextProps = {
  /** 全局表格配置 */
  globalTableProps?: ProTableProps<any, any>;

  /** 全局表单配置 */
  globalFormProps?: FormProps;

  /** 包裹容器的 div 属性（如 className、style 等） */
  outBoxProps?: React.HTMLAttributes<HTMLDivElement>;

  /** 模式映射（比如 "view" -> 只读组件） */
  ModeMap?: Record<string, (props: any) => React.ReactNode>;

  /** 自定义表单字段渲染配置 */
  FormValueType?: Record<string, ProRenderFieldPropsType>;

  /** 子节点 */
  children?: React.ReactNode;
};

// 推荐设置为 undefined 默认值，更安全
export const PlusContext = createContext<PlusContextProps | undefined>(
  undefined
);

export const PlusProvider: React.FC<PlusContextProps> = (props) => {
  const { children, ...rest } = props;

  return <PlusContext.Provider value={rest}>{children}</PlusContext.Provider>;
};
