import { BaseComponent } from '../interfaces';
import styles from './styles.module.scss';

interface AvatarProps {
  url?: string;
  shape?: 'circle' | 'square';
  defaultUrl?: string;
}

export const Avatar: BaseComponent<'div', AvatarProps> = ({
  url,
  shape = 'circle',
  defaultUrl,
  ...props
}) => {
  const imgUrl = url ?? defaultUrl;

  return (
    <div className={styles.avatar} {...props}>
      {imgUrl !== undefined && shape === 'circle' && (
        <img className={styles.avatarCircle} src={imgUrl} />
      )}
      {imgUrl !== undefined && shape === 'square' && (
        <img className={styles.avatarSquare} src={imgUrl} />
      )}
    </div>
  );
};
