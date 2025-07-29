import React, {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  BetaSchemaForm,
  PageContainer,
  ProFormProps,
  type ProFormColumnsType,
} from "@ant-design/pro-components";
import { Button, Modal } from "antd";
import { DefaultFormProps, DefaultProps, viewModeProps } from "../detail";
import { PlusContext } from "../components/plus";

const FormView: React.FC<DefaultFormProps> = ({
  schema,
  handlerOK,
  handlerDraft,
  handlerCancel,
  formProps,
}) => {
  const formRef = useRef();
  return (
    <>
      <BetaSchemaForm<any>
        formRef={formRef}
        shouldUpdate={false}
        onFinish={handlerOK}
        submitter={{
          render: (api: any) => {
            return (
              <div className="w-full flex justify-center gap-4 mt-2">
                {formProps?._extra?.showCancel && (
                  <Button onClick={handlerCancel}>取消</Button>
                )}
                {formProps?._extra?.showDraft && (
                  <Button
                    onClick={async () => {
                      await api.form.validateFields();
                      handlerDraft && handlerDraft(api.form?.getFieldsValue());
                    }}
                    type={"primary"}
                    ghost={true}
                  >
                    保存草稿箱
                  </Button>
                )}
                {formProps?._extra?.showSubmit && (
                  <Button
                    onClick={async () => {
                      await api.form.validateFields();
                      handlerOK && handlerOK(api.form?.getFieldsValue());
                    }}
                    type={"primary"}
                  >
                    {formProps?._extra?.submitText || "提交"}
                  </Button>
                )}
              </div>
            );
          },
        }}
        columns={schema as any[]}
        {...(formProps as any)}
      />
    </>
  );
};

const ModalMode: React.FC<DefaultProps> = ({
  modeProps,
  content,
  schema,
  handlerCancel,
  handlerDraft,
  handlerOK,
  formProps,
  title,
}) => {
  return (
    <Modal
      open={true}
      {...modeProps}
      footer={null}
      onCancel={handlerCancel}
      title={title}
    >
      <div className=" border-b border-solid border-gray-300 h-1 mb-6"></div>
      {content ? (
        content(schema, { handlerOK, handlerCancel, handlerDraft })
      ) : (
        <FormView
          schema={schema}
          handlerOK={handlerOK}
          handlerDraft={handlerDraft}
          handlerCancel={handlerCancel}
          formProps={formProps}
        />
      )}
    </Modal>
  );
};

const PageMode: React.FC<DefaultProps> = ({
  modeProps,
  content,
  handlerOK,
  handlerDraft,
  schema,
  formProps,
  title,
  handlerCancel,
}) => {
  return (
    <PageContainer
      className="bg-bg w-full h-full z-20 "
      header={{
        title,
      }}
      {...(modeProps as any)}
    >
      {content ? (
        content(schema, { handlerOK, handlerCancel })
      ) : (
        <FormView
          schema={schema}
          handlerOK={handlerOK}
          handlerDraft={handlerDraft}
          handlerCancel={handlerCancel}
          formProps={formProps}
        />
      )}
    </PageContainer>
  );
};

export interface DetailProps {
  ref: any;
  onSuccess?: () => void;
  formProps?: ProFormProps;
  onHideFather?: (e: any) => void | any;
}

type showWithDataParams =
  | "hide"
  | {
      data: any;
      mode: "modal" | "page" | "detailMode";
      custRender: Pick<DefaultProps, "content">;
      modeProps?: viewModeProps;
      formProps?: ProFormColumnsType<any>[];
      title?: string;
      handlerOK: (e: any) => Promise<void>;
      handlerDraft: (e: any) => Promise<void>;
      handlerCancel: (e: any) => void;
    };

/* main */
const Detail: React.FC<DetailProps> = forwardRef(
  ({ onHideFather, onSuccess, formProps }, ref) => {
    const [showMode, setShowMode] = useState("");
    const [baseOptions, setBaseOptions] = useState<DefaultFormProps>();

    const showWithData = (params: showWithDataParams) => {
      if (params === "hide") {
        setShowMode("hide");
        onHideFather && onHideFather(false);
      } else {
        //全屏模式
        if (params.mode === "page" || params.mode === "detailMode") {
          onHideFather && onHideFather(true);
        }
        setShowMode(params.mode);
        setBaseOptions({
          schema: params.data,
          title: params.title || "详情",
          // @ts-ignore
          [params.custRender ? "content" : ""]: function (e, options) {
            // @ts-ignore
            return params.custRender && params.custRender(e, options);
          },
          modeProps: params.modeProps,
          formProps: { ...formProps, ...params?.formProps } as any,
          handlerOK: async (e) => {
            await params.handlerOK(e);
            showWithData("hide");
            onSuccess && onSuccess();
          },
          handlerDraft: params?.handlerDraft
            ? async (e) => {
                await params.handlerDraft(e);
                showWithData("hide");
                onSuccess && onSuccess();
              }
            : null,
          handlerCancel: () => showWithData("hide"),
        });
      }
    };

    useImperativeHandle(ref, () => ({
      show: showWithData,
      hide: () => showWithData("hide"),
    }));

    const provide = useContext(PlusContext);

    const modeProps = {
      showFather: () => showWithData("hide"),
      onHideFather,
      ...baseOptions,
    };

    const ViewModeMap: Record<string, React.FunctionComponent> = {
      modal: ModalMode,
      page: PageMode,
      ...provide.ModeMap,
    };

    const Comp: any = ViewModeMap[showMode];
    return showMode && Comp ? <Comp {...modeProps} /> : <div>暂无匹配模式</div>;
  }
);

export default Detail;
