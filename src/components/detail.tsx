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
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                  marginTop: "0.5rem",
                }}
              >
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
        columns={schema as ProFormColumnsType[]}
        {...(formProps as any)}
      />
    </>
  );
};

const ModalMode: React.FC<DefaultProps> = ({
  modeProps,
  content,
  data,
  handlerCancel,
  handlerDraft,
  handlerOK,
  formProps,
  title,
}) => {
  return (
    <Modal
      open={true}
      {...(modeProps as any)}
      footer={null}
      onCancel={handlerCancel}
      title={title}
    >
      <div
        style={{
          borderBottom: "1px solid #D1D5DB",
          height: "0.25rem",
          marginBottom: "1.5rem",
        }}
      ></div>
      {content ? (
        content(data, { handlerOK, handlerCancel, handlerDraft })
      ) : (
        <FormView
          schema={data}
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
  data,
  formProps,
  title,
  handlerCancel,
}) => {
  return (
    <PageContainer
      style={{ height: "100%", width: "100%", zIndex: 20 }}
      header={{
        title,
      }}
      {...(modeProps as any)}
    >
      {content ? (
        content(data, { handlerOK, handlerCancel })
      ) : (
        <FormView
          schema={data}
          handlerOK={handlerOK}
          handlerDraft={handlerDraft}
          handlerCancel={handlerCancel}
          formProps={formProps}
        />
      )}
    </PageContainer>
  );
};

const FullMode: React.FC<DefaultProps> = ({
  modeProps,
  content,
  handlerOK,
  handlerDraft,
  data,
  formProps,
  handlerCancel,
}) => {
  return (
    <div {...(modeProps as any)}>
      {content ? (
        content(data, { handlerOK, handlerCancel })
      ) : (
        <FormView
          schema={data as any}
          handlerOK={handlerOK}
          handlerDraft={handlerDraft}
          handlerCancel={handlerCancel}
          formProps={formProps}
        />
      )}
    </div>
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
        if (
          params.mode === "page" ||
          params.mode === "detailMode" ||
          //@ts-ignore
          params.mode === "none"
        ) {
          onHideFather && onHideFather(true);
        }
        setShowMode(params.mode);
        setBaseOptions({
          //
          data: params.data,
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
      none: FullMode,
      ...provide?.ModeMap,
    };

    const Comp: any = ViewModeMap[showMode];
    return showMode && Comp ? (
      <Comp {...modeProps} />
    ) : (
      <div>暂无匹配模式,请用PlusProvide添加</div>
    );
  }
);

export default Detail;
