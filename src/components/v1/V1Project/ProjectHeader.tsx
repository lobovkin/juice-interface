import {
  SettingOutlined,
  ToolOutlined,
  TwitterOutlined,
} from '@ant-design/icons'
import { t, Trans } from '@lingui/macro'

import { Button, Tooltip } from 'antd'
import Discord from 'components/icons/Discord'
import EditProjectModal from 'components/v1/V1Project/modals/EditProjectModal'
import MigrateV1Pt1Modal from 'components/v1/V1Project/modals/MigrateV1Pt1Modal'
import ProjectToolDrawerModal from 'components/v1/V1Project/modals/ProjectToolDrawerModal'
import ProjectLogo from 'components/shared/ProjectLogo'
import { NetworkContext } from 'contexts/networkContext'
import { V1ProjectContext } from 'contexts/v1/projectContext'
import { ThemeContext } from 'contexts/themeContext'
import {
  OperatorPermission,
  useHasPermission,
} from 'hooks/v1/contractReader/HasPermission'
import { useContext, useState } from 'react'

import Paragraph from '../../shared/Paragraph'

export default function ProjectHeader() {
  const [editProjectModalVisible, setEditProjectModalVisible] =
    useState<boolean>(false)
  const [toolDrawerVisible, setToolDrawerVisible] = useState<boolean>(false)
  const [migrateDrawerVisible, setMigrateDrawerVisible] =
    useState<boolean>(false)
  const { userAddress } = useContext(NetworkContext)

  const {
    projectId,
    handle,
    metadata,
    isPreviewMode,
    isArchived,
    terminal,
    owner,
  } = useContext(V1ProjectContext)

  const {
    theme: { colors },
  } = useContext(ThemeContext)

  const headerHeight = 120

  const hasEditPermission = useHasPermission([
    OperatorPermission.SetHandle,
    OperatorPermission.SetUri,
  ])

  const prettyUrl = (url: string) => {
    if (url.startsWith('https://')) {
      return url.split('https://')[1]
    } else if (url.startsWith('http://')) {
      return url.split('http://')[1]
    } else return url
  }

  const linkUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return 'http://' + url
  }

  const spacing = 20

  const allowMigrate =
    terminal?.version === '1' &&
    userAddress &&
    owner?.toLowerCase() === userAddress?.toLowerCase()

  if (!projectId) return null

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            marginRight: '1.25rem',
            marginBottom: '1.25rem',
            height: '100%',
          }}
        >
          <ProjectLogo
            uri={metadata?.logoUri}
            name={metadata?.name}
            size={headerHeight}
          />
        </div>

        <div style={{ flex: 1, minWidth: '70%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
            <h1
              style={{
                fontSize: '2.4rem',
                lineHeight: '2.8rem',
                margin: 0,
                color: metadata?.name
                  ? colors.text.primary
                  : colors.text.placeholder,
              }}
            >
              {metadata?.name || t`Untitled project`}
            </h1>

            {!isPreviewMode && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    color: colors.text.tertiary,
                    paddingRight: 10,
                  }}
                >
                  <Trans>ID: {projectId.toNumber()}</Trans>{' '}
                  {terminal?.version && (
                    <Tooltip
                      title={t`Version of the terminal contract used by this project.`}
                    >
                      <span
                        style={{
                          padding: '2px 4px',
                          background: colors.background.l1,
                          cursor: allowMigrate ? 'pointer' : 'default',
                        }}
                        onClick={() => {
                          if (!allowMigrate) return
                          setMigrateDrawerVisible(true)
                        }}
                      >
                        V{terminal.version}
                      </span>
                    </Tooltip>
                  )}
                </span>

                <div>
                  <Button
                    onClick={() => setToolDrawerVisible(true)}
                    icon={<ToolOutlined />}
                    type="text"
                  />
                  {hasEditPermission && (
                    <Button
                      onClick={() => setEditProjectModalVisible(true)}
                      icon={<SettingOutlined />}
                      type="text"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              paddingTop: 8,
              paddingBottom: 4,
              fontWeight: 500,
            }}
          >
            {isArchived && (
              <span
                style={{
                  fontSize: '0.8rem',
                  color: colors.text.disabled,
                  textTransform: 'uppercase',
                  marginRight: spacing,
                }}
              >
                (archived)
              </span>
            )}
            {handle && (
              <span
                style={{
                  color: colors.text.secondary,
                  marginRight: spacing,
                  fontWeight: 600,
                }}
              >
                @{handle}
              </span>
            )}
            {metadata?.infoUri && (
              <a
                style={{ fontWeight: 500, marginRight: spacing }}
                href={linkUrl(metadata.infoUri)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {prettyUrl(metadata.infoUri)}
              </a>
            )}
            {metadata?.twitter && (
              <a
                style={{
                  fontWeight: 500,
                  marginRight: spacing,
                  whiteSpace: 'pre',
                }}
                href={'https://twitter.com/' + metadata.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span style={{ marginRight: 4 }}>
                  <TwitterOutlined />
                </span>
                @{prettyUrl(metadata.twitter)}
              </a>
            )}
            {metadata?.discord && (
              <a
                style={{
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: spacing,
                  whiteSpace: 'pre',
                }}
                href={linkUrl(metadata.discord)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span style={{ display: 'flex', marginRight: 4 }}>
                  <Discord size={13} />
                </span>
                Discord
              </a>
            )}
          </div>
          {metadata?.description && (
            <Paragraph
              description={metadata.description}
              characterLimit={250}
            />
          )}
        </div>
      </div>

      <EditProjectModal
        visible={editProjectModalVisible}
        metadata={metadata}
        handle={handle}
        onSuccess={() => setEditProjectModalVisible(false)}
        onCancel={() => setEditProjectModalVisible(false)}
      />

      <ProjectToolDrawerModal
        visible={toolDrawerVisible}
        onClose={() => setToolDrawerVisible(false)}
      />

      <MigrateV1Pt1Modal
        visible={migrateDrawerVisible}
        onCancel={() => setMigrateDrawerVisible(false)}
      />
    </div>
  )
}
