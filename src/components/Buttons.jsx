const BackButton = ({ onClick }) => <button onClick={onClick} title='Back'>⬅️</button>;
const ReloadButton = ({ onClick }) => <button onClick={onClick} title='Reload'>🔄</button>;
const EditButton = ({ onClick }) => <button onClick={onClick} title='Edit'>✏️</button>;
const DeleteButton = ({ onClick }) => <button onClick={onClick} title='Delete'>🗑️</button>;
const SaveButton = ({ onClick }) => <button onClick={onClick} title='Save'>💾</button>;
const CancelButton = ({ onClick }) => <button onClick={onClick} title='Cancel'>❌</button>;
const CreateButton = () => <button type='submit' title='Create'>✨</button>;

export {
  BackButton, ReloadButton,
  EditButton, DeleteButton, SaveButton, CancelButton,
  CreateButton,
};
