import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ORMUserAddress } from './orm.user-address.entity';
import { Gender } from 'src/modules/user/enums/gender.enum';
import { UserStatus } from 'src/modules/user/enums/user-status.enum';

@Entity('user_core', { schema: 'users_schema' })
export class ORMUserCore {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({
    name: 'username',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: true,
  })
  username: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({ name: 'gender', type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  email: string | null;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: true,
  })
  phoneNumber: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: false })
  avatarUrl: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({
    name: 'date_of_birth_changed_at',
    type: 'timestamp',
    nullable: true,
  })
  dateOfBirthChangedAt: Date | null;

  @Column({ name: 'gender_changed_at', type: 'timestamp', nullable: true })
  genderChangedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // user_core -> user_addresses (1:N)
  @OneToMany(() => ORMUserAddress, (userAddress) => userAddress.user)
  addresses: ORMUserAddress[];
}
