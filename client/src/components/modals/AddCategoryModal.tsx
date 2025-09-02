// src/components/modals/AddCategoryModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import type { InputRef } from 'antd';
import { categoryService } from '../../services/categoryService';

interface UICategory {
  id: number;
  name: string;
  description?: string;
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: (newCategory: UICategory) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryAdded,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => nameInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        try { (e as any).stopImmediatePropagation?.(); } catch {}
        handleCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', onKey, true);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields(); 

      const created = await categoryService.create({
        nombre: values.name,
        descripcion: values.description ?? '',
      });

      const uiCategory: UICategory = {
        id: created.id,
        name: created.nombre,
        description: created.descripcion,
      };

      message.success('Categoría agregada exitosamente');
      onCategoryAdded(uiCategory);
      form.resetFields();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return; 
      console.error(err);
      message.error(err?.message ?? 'Error al agregar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const name = Form.useWatch('name', form);
  const isNameInvalid = !name || name.trim().length < 2 || name.trim().length > 50;
  const okDisabled = loading || isNameInvalid;
  const okStyle = okDisabled
            ? { backgroundColor: '#e5e7eb', borderColor: '#e5e7eb', color: '#6b7280' } 
            : { backgroundColor: '#000000', borderColor: '#000000', color: '#ffffff' }; 
  return (
    <Modal
      title="Agregar Nueva Categoría"
     
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={loading ? 'Guardando…' : 'Crear Categoría' }
       okButtonProps={{
                loading,
                disabled: okDisabled,
                style: okStyle,              
      }}
      cancelButtonProps={{ disabled: loading }}
      destroyOnHidden
      maskClosable={false}   
      keyboard={false}      
      getContainer={false}   
      centered
      modalRender={(node) => (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {node}
        </div>
      )}
    >
      <Form form={form} layout="vertical" name="addCategoryForm" initialValues={{ name: '', description: '' }}>
        <Form.Item
          label="Nombre de la Categoría"
          name="name"
          rules={[
            { required: true, message: 'Por favor ingresa el nombre de la categoría' },
            { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
            { max: 50, message: 'El nombre no puede exceder los 50 caracteres' },
          ]}
          validateStatus={isNameInvalid && name ? 'error' : undefined}
        >
          <Input
            placeholder="Ej: Alimentos, Juguetes, Accesorios..."
            ref={nameInputRef}
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          label="Descripción (Opcional)"
          name="description"
          rules={[{ max: 200, message: 'La descripción no puede exceder los 200 caracteres' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Descripción opcional..."
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
