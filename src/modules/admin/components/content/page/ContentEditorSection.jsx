import { ContentEditor } from '../blocks/ContentEditor.jsx';

export const ContentEditorSection = ({ contentHook }) => {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0">Bloques de Contenido</h5>
      </div>
      <div className="card-body">
        <ContentEditor contentHook={contentHook} />
      </div>
    </div>
  );
};