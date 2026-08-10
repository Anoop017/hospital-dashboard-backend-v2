export const MockRepository = jest.fn().mockReturnValue({
  create: jest.fn().mockImplementation((dto) => dto),
  save: jest.fn().mockResolvedValue({ id: 'some-uuid' }),
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  merge: jest.fn().mockImplementation((entity, dto) => Object.assign(entity, dto)),
  softRemove: jest.fn().mockResolvedValue(undefined),
});

export const MockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((entity, dto) => dto),
    save: jest.fn(),
  },
};
