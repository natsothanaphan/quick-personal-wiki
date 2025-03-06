const BackButton = (props) => <button {...props} title='Back'>⬅️</button>;
const ReloadButton = (props) => <button {...props} title='Reload'>🔄</button>;
const EditButton = (props) => <button {...props} title='Edit'>✏️</button>;
const DeleteButton = (props) => <button {...props} title='Delete'>🗑️</button>;
const SaveButton = (props) => <button {...props} title='Save'>💾</button>;
const CancelButton = (props) => <button {...props} title='Cancel'>❌</button>;
const CreateButton = (props) => <button {...props} title='Create'>✨</button>;

export {
  BackButton, ReloadButton,
  EditButton, DeleteButton, SaveButton, CancelButton,
  CreateButton,
};
