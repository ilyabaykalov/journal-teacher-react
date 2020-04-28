import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import classNames from 'classnames';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { Badge, host } from '../../components';

import './Сhapter.scss';

library.add(fas);

const Chapter = ({ items, isRemovable, onClick, onRemove, onClickItem, activeItem }) => {
	const removeChapter = chapter => {
		const chapterName = chapter.name;

		Swal.fire({
			title: `Вы уверены что хотите удалить главу\n"${ chapterName }"?`,
			icon: 'question',
			confirmButtonColor: '#42B883',
			cancelButtonColor: '#C9D1D3',
			confirmButtonText: 'Да, удалить',
			showCancelButton: true,
			cancelButtonText: 'Отмена',
			focusConfirm: false,
			focusCancel: false,
		}).then(result => {
			if (result.value) {
				axios.delete(`http://${ host.ip }:${ host.port }/chapters/${ chapter.id }`).then(() => {
					onRemove(chapter.id);
				}).then(() => {
					console.debug(`Глава '${ chapterName }' успешно удалена`);
				}).catch(error => {
					Swal.fire({
						icon: 'error',
						title: 'Не удалось удалить главу'
					}).finally(() => {
						console.error('Не удалось удалить главу');
						console.error(`Ошибка: ${ error }`);
					});
				});
			}
		});
	};

	return (
		<ul className='chapter' onClick={ onClick }>
			{ items.map((item, index) => (
				<li key={ index }
				    className={ classNames(item.className, {
					    active: item.active
						    ? item.active
						    : activeItem && activeItem.id === item.id
				    }) }
				    onClick={ onClickItem ? () => onClickItem(item) : null }>
					{ item.icon ?
						<FontAwesomeIcon className={ 'icon' }
						                 icon={ item.icon }/> :
						<Badge color={ item.color.name }/>
					}
					<span>
						{ item.name }
						{ item.lessons && ` (${ item.lessons.filter(lesson => lesson.completed).length }/${ item.lessons.length })` }
					</span>
					{ isRemovable && (
						<FontAwesomeIcon className={ 'chapter__remove-button' }
						                 icon={ 'times' }
						                 color={ 'transparent' }
						                 onClick={ () => removeChapter(item) }/>
					) }
				</li>
			)) }
		</ul>
	);
};

export default Chapter;
