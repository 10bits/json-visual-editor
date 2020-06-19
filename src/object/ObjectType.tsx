import React, { useState, useCallback, useMemo } from 'react';
import _ from 'lodash';
import BooleanType from './BooleanType';
import NumberType from './NumberType';
import StringType from './StringType';
import Expander from '../Expander';
import { EditButtons } from '../VisualizedData/EditButtons';
import { Path } from '../types';
import { ValueEditor } from '../VisualizedData/ValueEditor';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '..';
import { dataSlice } from '../features/data/dataSlice';
import { KeyEditButtons } from '../VisualizedData/KeyEditButtons';

interface Props {
  data: any;
  path: Path;
  insert?: boolean;
}

const maxLevel = 20;

const ObjectType: React.FC<Props> = ({ data, path, insert = true }) => {
  const [expanded, setExpanded] = useState(true);

  const onChangeExpansion = (isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  // for editing
  const editMode = useSelector((state: RootState) => state.data.editMode);

  const dispatch = useDispatch();
  const { setEditMode, updateDataOfPath, duplicatePath } = dataSlice.actions;
  const onUpdate = useCallback(
    (path, data) => {
      // update the value
      dispatch(updateDataOfPath({ path, data }));
      // close
      dispatch(setEditMode(null));
    },
    [dispatch, setEditMode, updateDataOfPath]
  );
  const onCancel = useCallback(() => {
    // close
    dispatch(setEditMode(null));
  }, [dispatch, setEditMode]);

  const onAddButtonClicked = useCallback(
    (event) => {
      const name = event.target.dataset.name;
      dispatch(duplicatePath([...path, name]));
    },
    [path]
  );

  let result = <></>;
  if (data === null) {
    // null
    result = <span className="null">null</span>;
  } else if (data !== null && typeof data === typeof {}) {
    // Object or Array
    let rows = Object.keys(data).map((name) => {
      const newPath = path.length === 0 ? [name] : [...path, name];
      return (
        <tr key={name}>
          {insert && (
            <td className="button-cell">
              <i
                className="fas fa-plus-circle"
                data-name={name}
                onClick={onAddButtonClicked}
              />
            </td>
          )}
          <th>
            <div className="d-flex">
              <KeyEditButtons
                data={data}
                path={newPath}
                hidden={editMode !== null}
              />
              <span className="key-label" title={newPath.join('.')}>
                {name}
              </span>
            </div>
          </th>
          <td>
            <div className="d-flex">
              <div className="flex-grow-1">
                {editMode !== null && _.isEqual(newPath, editMode.path) ? (
                  <ValueEditor
                    path={newPath}
                    defaultValue={data[name]}
                    onUpdate={onUpdate}
                    onCancel={onCancel}
                  />
                ) : (
                  <ObjectType data={data[name]} path={newPath} />
                )}
              </div>
              {editMode === null && (
                <EditButtons
                  data={data[name]}
                  path={newPath}
                  hidden={editMode !== null}
                />
              )}
            </div>
          </td>
        </tr>
      );
    });
    const typeLabel = Array.isArray(data) ? 'Array' : 'Object';
    const headerLabel = '[' + rows.length.toString() + ']';
    result = (
      <table className={`${insert ? '' : 'no-margin'}`}>
        <thead data-level={path.length % maxLevel}>
          <tr>
            {insert && (
              <td className="button-cell">
                <i
                  className="fas fa-plus-circle"
                  data-name={''}
                  onClick={onAddButtonClicked}
                />
              </td>
            )}
            <th className="expand">
              <Expander
                defaultValue={expanded}
                onChangeExpansion={onChangeExpansion}
              />
            </th>
            <th className="objectType">{`${typeLabel} ${headerLabel}`}</th>
          </tr>
        </thead>
        <tbody className={expanded ? 'expanded' : ''}>{rows}</tbody>
      </table>
    );
  } else if (typeof data === typeof 1) {
    // Number
    result = <NumberType data={data} />;
  } else if (typeof data === typeof 'a') {
    // String
    result = <StringType data={data} />;
  } else if (typeof data === typeof true) {
    // Boolean
    result = <BooleanType data={data} />;
  } else {
    // something else
    result = (
      <span className="undefined" title={path.join('.')}>
        {data}
      </span>
    );
  }
  return result;
};

export default ObjectType;
